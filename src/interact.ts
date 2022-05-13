import { Brick, OmeggaPlayer, Vector, WriteSaveObject } from 'omegga';
import {
  ActiveDoor,
  addActiveDoor,
  checkActiveDoor,
  cleanupActiveDoor,
} from './antispam';
import { isAuthorized } from './auth';
import { getPin, hasPin } from './commands';
import { Config } from './config';
import { getDoorSelection, toggleDoorState } from './door';
import { vecAbs, vecSub } from './math';
import { decodeDoorState, DoorState } from './state';

export const INTERACT_DOOR_PATTERN =
  /^door:(?<open>[oc]):(?<base64>(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/;

export const INTERACT_TRIGGER_PATTERN =
  /^door:t:(?<relX>~)?(?<x>-?\d+),(?<relY>~)?(?<y>-?\d+),(?<relZ>~)?(?<z>-?\d+)\|(?<ex>\d+),(?<ey>\d+),(?<ez>\d+)$/;

/** get door state from console tag */
export function parseDoorConsoleTag(
  message: string,
  config?: Config,
  player?: OmeggaPlayer
): { open: boolean; state: DoorState } {
  const match = message.match(INTERACT_DOOR_PATTERN);
  if (!match) return null;

  const open = match.groups.open === 'o';

  const state =
    (player && hasPin(player.id)
      ? decodeDoorState(match.groups.base64, getPin(player.id))
      : null) ?? decodeDoorState(match.groups.base64);

  if (!state) {
    if (player && config)
      Omegga.whisper(
        player,
        `Unable to decode door data. Door could be encrypted${
          config['allow-password'] ? ' (<code>/doorpass p4ssw0rd</>)' : ''
        } or could be from an outdated plugin.`
      );

    return null;
  }
  return { open, state };
}

/** get center/region from trigger console tag */
export function parseTriggerConsoleTag(message: string, position: Vector) {
  const match = message.match(INTERACT_TRIGGER_PATTERN);
  if (!match) return null;

  return {
    center: [
      Number(match.groups.x) + (match.groups.relX ? position[0] : 0),
      Number(match.groups.y) + (match.groups.relY ? position[1] : 0),
      Number(match.groups.z) + (match.groups.relZ ? position[2] : 0),
    ] as Vector,
    extent: [
      Number(match.groups.ex),
      Number(match.groups.ey),
      Number(match.groups.ez),
    ] as Vector,
  };
}

/** ensure a trigger follows config */
export function validateTriggerState(
  config: Config,
  player: OmeggaPlayer,
  position: Vector,
  region: { center: Vector; extent: Vector }
) {
  if (!config['allow-triggers']) {
    Omegga.whisper(player, `Triggers are not enabled.`);
    return false;
  }

  const triggerMaxDist = Math.hypot(...vecAbs(vecSub(position, region.center)));
  if (triggerMaxDist / 10 > config['max-door-shift']) {
    Omegga.whisper(
      player,
      `This further from the door than the max configured distance (${config['max-door-shift']})`
    );
    return false;
  }

  if (Math.max(...region.extent) / 10 > config['max-door-size']) {
    Omegga.whisper(
      player,
      `This trigger is larger than the max configured size (${config['max-door-size']})`
    );
    return false;
  }

  return true;
}

/** ensure a door does not have disable flags set */
export async function validateDoorState(
  config: Config,
  player: OmeggaPlayer,
  state: DoorState
) {
  if (state.flags.oneway && !config['allow-one-way']) {
    Omegga.middlePrint(player, `One way doors are disabled.`);
    return false;
  }

  if (state.flags.oneway && !config['allow-destruction']) {
    Omegga.middlePrint(player, `Self destructing doors are disabled.`);
    return false;
  }

  // this shouldn't ever happen but if it does... we should probably not let it happen
  if (state.brick_size > 65535) {
    // make sure door bounds are small enough
    Omegga.whisper(player, 'Doors this large are not supported');
    return false;
  }
  if (state.brick_size / 10 > config['max-door-size']) {
    Omegga.whisper(
      player,
      `This door is larger than the max configured size (${config['max-door-size']})`
    );
    return false;
  }
  return true;
}

/** check door permissions/etc */
export function validateDoorBrick(
  config: Config,
  player: OmeggaPlayer,
  state: DoorState,
  ownerId: string
): boolean {
  if (
    config['create-only-authorized'] &&
    !isAuthorized(config, ownerId, 'create')
  ) {
    Omegga.middlePrint(
      player,
      `This door was built by someone who does not have permission to create doors.`
    );
    return false;
  }

  if (state.flags.private) {
    // check if private doors are enabled
    if (!config['allow-private']) {
      Omegga.middlePrint(player, `Private doors are disabled.`);
      return false;
    }

    // check if this players is the owner or the player is authorized
    if (
      ownerId !== player.id &&
      !(config['authorized-unlock'] && isAuthorized(config, player.id, 'use'))
    ) {
      Omegga.middlePrint(player, `You are not authorized to open this door.`);
      return false;
    }
  }
  return true;
}

/** lookup a brick by position and filter fn
 * @param unique when enabled, require this door to be unique
 */
export async function getDoorBrickQuery(
  region: { center: Vector; extent: Vector },
  query: (brick: Brick) => boolean,
  unique?: boolean
): Promise<{ brick: Brick; ownerId: string }> {
  // get the save data around the clicked brick
  const saveData = await Omegga.getSaveData(region);

  // no bricks detected
  if (!saveData || saveData.bricks.length === 0) return null;

  // ensure the brick version has components
  if (saveData.version !== 10) return null;

  // find brick based on query
  const index = saveData.bricks.findIndex(query);
  const brick = index > -1 ? saveData.bricks[index] : null;

  // prevent multiple bricks in the same position from being clicked
  if (
    unique &&
    index > -1 &&
    saveData.bricks.some((b, i) => query(b) && i !== index)
  )
    return null;

  if (!brick) return null;

  return { brick, ownerId: saveData.brick_owners[brick.owner_index - 1].id };
}

/** given a trigger region, find the first brick that is a door (valid or not) */
export async function getDoorBrickFromTrigger(region: {
  center: Vector;
  extent: Vector;
}): Promise<{ brick: Brick; ownerId: string }> {
  // find the first brick with a door console tag
  return getDoorBrickQuery(region, b =>
    Boolean(b.components.BCD_Interact?.ConsoleTag.match(/^door:[oc]:/))
  );
}

/** get a brick's data from interact metadata (for relative positioning) */
export async function getDoorBrickFromInteract(
  position: Vector,
  state: DoorState
): Promise<{ brick: Brick; ownerId: string }> {
  // find the brick that has a matching position to this one
  return getDoorBrickQuery(
    {
      center: position as Vector,
      extent: [state.brick_size, state.brick_size, state.brick_size] as Vector,
    },
    b => b.position.every((p, i) => position[i] === p),
    true
  );
}

/** trigger a door from a brick and state */
export async function activateDoor(
  brick: Brick,
  ownerId: string,
  open: boolean,
  state: DoorState
) {
  // race condition detection for when two players click a brick within the same door region
  let activeDoorRegion: ActiveDoor;
  try {
    if (checkActiveDoor(brick.position)) return;
    const { center, extent } = getDoorSelection(state, brick);
    activeDoorRegion = { center, extent };
    addActiveDoor(activeDoorRegion);

    // get door data from the brick position
    const doorData = (await Omegga.getSaveData({
      center,
      extent,
    })) as WriteSaveObject;

    // filter bricks by the clicked brick's owner
    if (doorData?.bricks) {
      doorData.bricks = doorData.bricks.filter(
        b => doorData.brick_owners[b.owner_index - 1].id === ownerId
      );
    }

    if (!doorData || doorData.bricks.length === 0) {
      cleanupActiveDoor(activeDoorRegion);
      return console.warn(
        '[interact] error finding door bricks at center:',
        center.join(', '),
        'extent:',
        extent.join(', ')
      );
    }

    // who cares about opening the door if we're destroying it anyway
    if (!state.flags.destruction)
      doorData.bricks = toggleDoorState(open, state, brick, doorData.bricks);

    // strip console tags from this door if oneway is enabled
    if (state.flags.oneway) {
      for (const b of doorData.bricks) {
        if (b.components.BCD_Interact?.ConsoleTag.startsWith('door:')) {
          b.components.BCD_Interact.ConsoleTag = '';
        }
      }
    }

    // clear the old door bricks
    Omegga.writeln(
      `Bricks.ClearRegion ${center.join(' ')} ${extent.join(' ')} ${ownerId}`
    );

    // if the door doesn't have destruction enabled (like most doors do), load the next door state
    if (!state.flags.destruction)
      await Omegga.loadSaveData(doorData, { quiet: true });

    cleanupActiveDoor(activeDoorRegion);
  } catch (err) {
    console.error('error activating door', err);
    cleanupActiveDoor(activeDoorRegion);
  }
}
