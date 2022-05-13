import { BrickBounds, Vector } from 'omegga';
import { isAuthorized } from './auth';
import { Config } from './config';
import { resetDoors } from './door';
import {
  olookup,
  orientationStr,
  orotate,
  vecAbs,
  vecScale,
  vecSub,
} from './math';
import { DoorOptions, DoorState, encodeDoorState } from './state';
import { getTriggerBounds } from './triggers';

const {
  BRICK_CONSTANTS: { orientationMap },
  d2o,
  getBrickSize,
} = OMEGGA_UTIL.brick;

// cache for pins used by players (so they don't have to re-enter the pins)
const pinCache: Record<string, number[]> = {};

export const hasPin = (id: string) => id in pinCache;
export const getPin = (id: string) => pinCache[id];

// regions players have selected for triggers
const triggerRegions: Record<string, BrickBounds> = {};

export const cmdDoorPass =
  (config: Config) => async (name: string, password: string) => {
    const player = Omegga.getPlayer(name);
    if (!player) return;
    if (!isAuthorized(config, player.id, 'use')) return;

    if (!password)
      return Omegga.whisper(
        name,
        'Please specify a password: /doorpass p4ssw0rd.'
      );
    if (password.includes(':'))
      return Omegga.whisper(
        name,
        'Passwords cannot contain : because it is used in option parsing'
      );
    if (password.split('').some(c => c.charCodeAt(0) > 256))
      return Omegga.whisper(name, 'Unicode is not supported in pins.');
    if (password.length > 32)
      return Omegga.whisper(
        name,
        "Pins longer than 32 characters don't add entropy."
      );
    Omegga.whisper(name, 'Pin has been stored.');
    pinCache[player.id] = password.split('').map(c => c.charCodeAt(0));
  };

export const cmdDoorRegion = (config: Config) => async (name: string) => {
  const player = Omegga.getPlayer(name);
  if (!player) return;
  if (!isAuthorized(config, player.id, 'create')) return;

  const bounds = await getTriggerBounds(player, config);
  if (!bounds) return;
  Omegga.whisper(
    player,
    'Region stored in memory! Now you can run <code>/doortrigger</>'
  );
  triggerRegions[player.id] = bounds;
};

export const cmdResetDoors = (config: Config) => async (name: string) => {
  const player = Omegga.getPlayer(name);
  if (!player) return;
  if (!isAuthorized(config, player.id)) return;

  try {
    Omegga.broadcast(`<b>${name}</> is resetting doors...`);
    const data = await Omegga.getSaveData();
    if (data.bricks.length === 0 || data.version !== 10) {
      return;
    }
    const count = await resetDoors(data);
    Omegga.broadcast(`<b>${count}</> doors were reset`);
  } catch (err) {
    console.error('error resetting all doors', err);
    Omegga.broadcast(`Error resetting doors (${name})`);
  }
};

export const cmdDoorTrigger = (config: Config) => async (name: string) => {
  const player = Omegga.getPlayer(name);
  if (!player) return;
  if (!isAuthorized(config, player.id, 'create')) return;

  const bounds = triggerRegions[player.id];
  if (!bounds) {
    Omegga.whisper(
      player,
      'No door region selected. Copy some bricks and run <code>/doorregion</> to specify a door to trigger.'
    );
    return;
  }

  const data = await player.getTemplateBoundsData();

  if (!data || data.brick_count === 0) {
    Omegga.whisper(
      player,
      'No selected bricks. Copy some bricks to use as your trigger.'
    );
    return;
  }

  if (data.brick_count > config['max-door-bricks']) {
    Omegga.whisper(
      player,
      `This trigger contains more bricks than allowed (${config['max-door-bricks']})`
    );
    return;
  }

  if (data.version !== 10) {
    Omegga.whisper(player, 'Unsupported BRS version');
    return;
  }

  const extent = vecAbs(
    vecScale(vecSub(bounds.maxBound, bounds.minBound), 0.5)
  );

  delete data.components;
  for (const brick of data.bricks) {
    brick.components.BCD_Interact ??= {
      bPlayInteractSound: false,
      Message: '',
      ConsoleTag: '',
    };

    // door:t:x,y,z|ex,ey,ez
    // may need to encode this into bytes to store data for long range triggers
    // but whatever
    brick.components.BCD_Interact.ConsoleTag = `door:t:${bounds.center.join(
      ','
    )}|${extent.join(',')}`;
  }

  await player.loadSaveData(data);
  Omegga.whisper(
    player,
    'You can paste these bricks. This is a trigger template. It will open/close the first door it finds in the selected region.'
  );
};

export const cmdDoor =
  (config: Config) =>
  async (name: string, ...args: string[]) => {
    const player = Omegga.getPlayer(name);
    if (!player) return;

    const options: DoorOptions = {};
    try {
      for (const o of args) {
        const [option, value] = o.split(':');
        switch (option) {
          case 'private':
            if (!config['allow-private']) throw 'Private doors are disabled';
            options.private = true;
            break;
          case 'oneway':
            if (!config['allow-one-way']) throw 'One-Way doors are disabled';
            options.oneway = true;
            break;
          case 'destruction':
            if (!config['allow-destruction'])
              throw 'Self destructing doors are disabled';
            options.destruction = true;
            break;
          case 'disabled':
            if (!config['allow-disabled'])
              throw 'Disabled doors are ...disabled lol?';
            options.disabled = true;
            break;
          case 'resettable':
            if (!config['allow-resettable'])
              throw 'Resettable doors are disabled';
            options.resettable = true;
            break;
          case 'unclosable':
            if (!config['allow-unclosable'])
              throw 'Unclosable doors are disabled';
            options.unclosable = true;
            break;
          case 'password':
          case 'pin':
            if (!config['allow-password'])
              throw 'Passworded doors are disabled';
            if (!value || typeof value !== 'string')
              throw 'No pin provided. use pin:1234abc';
            if (value.split('').some(c => c.charCodeAt(0) > 256))
              throw 'Unicode is not supported in pins.';
            if (value.length > 32)
              throw "Pins longer than 32 characters don't add entropy.";
            if (value === '69') Omegga.whisper(name, 'nice.');
            options.pin = value.split('').map(c => c.charCodeAt(0));
            break;
          default:
            throw 'Unrecognized door option: ' + option.replace(/\W/g, '');
        }
      }
    } catch (err) {
      if (typeof err !== 'string')
        console.error('error parsing door options', err);
      else Omegga.whisper(name, 'Error parsing door options: ' + err);
    }

    if (!isAuthorized(config, player.id, 'create')) {
      Omegga.whisper(
        player,
        'You are not authorized to create doors on this server.'
      );
      return;
    }

    try {
      // start setting up a door
      const bounds = await player.getTemplateBounds();
      if (!bounds) {
        Omegga.whisper(
          player,
          'No selected bricks. Copy some bricks and move your template where you want the door to open.'
        );
        return;
      }

      const doorBoundsSize = Math.max(
        ...vecSub(bounds.maxBound, bounds.minBound)
      );

      if (doorBoundsSize > 65535) {
        // make sure door bounds are small enough
        Omegga.whisper(player, 'Doors this large are not supported');
        return;
      }
      if (doorBoundsSize / 10 > config['max-door-size']) {
        Omegga.whisper(
          player,
          `This door is larger than the max configured size (${config['max-door-size']})`
        );
        return;
      }

      const data = await player.getTemplateBoundsData();

      if (!data || data.brick_count === 0) {
        Omegga.whisper(
          player,
          'No selected bricks. Copy some bricks and move your template where you want the door to open.'
        );
        return;
      }

      if (data.brick_count > config['max-door-bricks']) {
        Omegga.whisper(
          player,
          `This door contains more bricks than allowed (${config['max-door-bricks']})`
        );
        return;
      }

      if (data.version !== 10) {
        Omegga.whisper(player, 'Unsupported BRS version');
        return;
      }

      // door configuration
      const ghost = await player.getGhostBrick();
      if (!ghost) {
        Omegga.whisper(
          player,
          'Missing ghost brick. Copy some bricks and move your template where you want the door to open.'
        );
        return;
      }

      const orientation = d2o(...orientationMap[ghost.orientation]);

      const door: Partial<DoorState> = {
        extent: vecAbs(vecScale(vecSub(bounds.maxBound, bounds.minBound), 0.5)),
        shift: vecSub(ghost.location as Vector, bounds.center),
        orientation: {
          self: d2o(4, 0),
          open: orientation,
        },
      };

      const ghostBrickDistance = Math.max(...vecAbs(door.shift));
      if (ghostBrickDistance > 65535) {
        Omegga.whisper(
          player,
          'This door moves further than the max supported distance'
        );
        return;
      }
      if (ghostBrickDistance / 10 > config['max-door-shift']) {
        Omegga.whisper(
          player,
          `This door moves further than the max configured shift (${config['max-door-shift']})`
        );
        return;
      }

      for (const brick of data.bricks) {
        const brickOrientation = d2o(brick.direction, brick.rotation);

        // this likely does not need to be computed here (per brick)
        // and could be done on only the first brick
        const relativeOpenOrientation = olookup(
          brickOrientation,
          orotate(brickOrientation, orientation)
        );

        // initialize interact component if it doesn't exist
        brick.components.BCD_Interact ??= {
          bPlayInteractSound: false,
          Message: '',
          ConsoleTag: '',
        };

        // add encoded door state
        brick.components.BCD_Interact.ConsoleTag = `door:c:${encodeDoorState({
          brick_size: Math.max(
            ...(getBrickSize(brick, data.brick_assets) ?? [0])
          ),
          orientation: {
            open: relativeOpenOrientation,
            // self orientation is needed to compute the relative extent/center
            // as newly placed templates don't know what their original position was
            self: brickOrientation,
          },
          extent: door.extent,
          shift: door.shift,
          center: vecSub(bounds.center, brick.position),
          flags: options,
        })}`;
      }
      delete data.components;

      await player.loadSaveData(data);
      Omegga.whisper(
        player,
        'You can paste these bricks. This is a <b>CLOSED</> door template. It will <b>OPEN when you click</>.'
      );
    } catch (err) {
      console.error(err);
      Omegga.whisper(player, 'An error occured... Sorry!');
    }
  };

export async function initDebugCommands() {
  Omegga.on('cmd:g', async (name: string) => {
    try {
      const g = await Omegga.getPlayer(name).getGhostBrick();
      Omegga.whisper(name, g.orientation);
    } catch (err) {
      console.error(err);
    }
  });

  Omegga.on('cmd:o', async (name: string) => {
    try {
      const o = await Omegga.getPlayer(name).getTemplateBoundsData();
      for (const b of o.bricks) {
        Omegga.whisper(
          name,
          orientationStr[d2o(b.direction, b.rotation)] +
            ' ' +
            o.brick_assets[b.asset_name_index]
        );
      }
    } catch (err) {
      console.error(err);
    }
  });
}
