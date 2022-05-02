import { BrickBounds, OmeggaPlayer } from 'omegga';
import type { Config } from '../omegga.plugin';
import { vecSub } from './math';

export const getTriggerBounds = async (
  player: OmeggaPlayer,
  config: Config
): Promise<BrickBounds> => {
  const bounds = await player.getTemplateBounds();
  if (!bounds) {
    Omegga.whisper(
      player,
      'No selected bricks. Copy an area where your trigger should scan.'
    );
    return null;
  }

  const doorBoundsSize = Math.max(...vecSub(bounds.maxBound, bounds.minBound));

  if (doorBoundsSize > 65535) {
    // make sure door bounds are small enough
    Omegga.whisper(player, 'Triggers this large are not supported');
    return null;
  }

  if (doorBoundsSize / 10 > config['max-door-size']) {
    Omegga.whisper(
      player,
      `This trigger region is larger than the max configured size (${config['max-door-size']})`
    );
    return null;
  }

  return bounds;
};
