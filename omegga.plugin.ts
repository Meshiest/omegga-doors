import OmeggaPlugin, {
  OL,
  OmeggaPlayer,
  PC,
  PS,
  Vector,
  WriteSaveObject,
} from 'omegga';
import { getDoorSelection, toggleDoorState } from 'src/door';
import {
  applyTable,
  differenceTable,
  inversionTable,
  olookup,
  orelative,
  orientationStr,
  orotate,
  vecAbs,
  vecScale,
  vecSub,
} from 'src/math';
import {
  decodeDoorState,
  DoorOptions,
  DoorState,
  encodeDoorState,
} from 'src/state';
import 'src/test';

const {
  BRICK_CONSTANTS: { orientationMap },
  d2o,
  getBrickSize,
} = OMEGGA_UTIL.brick;

type Config = {
  // done, untested
  'create-only-authorized': boolean;
  // done, untested
  'use-only-authorized': boolean;
  // done, untested
  'authorized-users': { id: string; name: string }[];
  // done, untested
  'authorized-role': string;
  // done, untested
  'allow-one-way': boolean;
  // done, untested
  'allow-destruction': boolean;
  // done, untested
  'allow-private': boolean;
  // done, untested
  'allow-password': boolean;
  // done, need triggers to be implemented to finish
  'allow-disabled': boolean;
  // not implemented
  'allow-triggers': boolean;
  // done, untested
  'authorized-unlock': boolean;
  // done, untested
  'anti-spam-throttle': number;
  // done, untested, not implemented on triggers
  'max-door-bricks': number;
  // done, untested, not implemented on triggers
  'max-door-size': number;
  // done, untested, not implemented on triggers
  'max-door-shift': number;
};
type Storage = {};

const DEBUG_MODE = false;

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  /** check if a player is authorized by config */
  isAuthorized(playerId: string, mode: 'use' | 'create') {
    const hasRole = () =>
      Player.getRoles(Omegga, playerId).includes(
        this.config['authorized-role']
      );
    const isAuthorizedUser = () =>
      this.config['authorized-users'].some(u => u.id === playerId);
    return (
      (mode === 'create' &&
        (!this.config['create-only-authorized'] ||
          hasRole() ||
          isAuthorizedUser())) ||
      (mode === 'use' &&
        (!this.config['use-only-authorized'] ||
          hasRole() ||
          isAuthorizedUser()))
    );
  }

  async init() {
    // cache for pins used by players (so they don't have to re-enter the pins)
    const pinCache: Record<string, number[]> = {};

    // debug commands for getting template and brick orientations
    if (DEBUG_MODE) {
      this.omegga.on('cmd:g', async (name: string) => {
        try {
          const g = await this.omegga.getPlayer(name).getGhostBrick();
          this.omegga.whisper(name, g.orientation);
        } catch (err) {
          console.error(err);
        }
      });

      this.omegga.on('cmd:o', async (name: string) => {
        try {
          const o = await this.omegga.getPlayer(name).getTemplateBoundsData();
          for (const b of o.bricks) {
            this.omegga.whisper(
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

    const antispam = {};
    const throttleAmount = Math.min(
      Math.max(this.config['anti-spam-throttle'], 0),
      60000
    );
    const handleAntispam = async (id: string) => {
      if (throttleAmount === 0) return;

      if (id in antispam) {
        // anti spam on second click onward
        clearTimeout(antispam[id]);
        await new Promise(
          resolve => (antispam[id] = setTimeout(resolve, throttleAmount))
        );
        delete antispam[id];
      } else {
        // no antispam on first click
        antispam[id] = setTimeout(() => {
          delete antispam[id];
        }, throttleAmount);
      }
    };

    if (this.config['allow-password'])
      this.omegga.on('cmd:doorpass', async (name: string, password: string) => {
        const player = Omegga.getPlayer(name);
        if (!player) return;
        if (!password)
          return this.omegga.whisper(
            name,
            'Please specify a password: /doorpass p4ssw0rd.'
          );
        if (password.includes(':'))
          return this.omegga.whisper(
            name,
            'Passwords cannot contain : because it is used in option parsing'
          );
        if (password.split('').some(c => c.charCodeAt(0) > 256))
          return this.omegga.whisper(name, 'Unicode is not supported in pins.');
        if (password.length > 32)
          return this.omegga.whisper(
            name,
            "Pins longer than 32 characters don't add entropy."
          );
        this.omegga.whisper(name, 'Pin has been stored.');
        pinCache[player.id] = password.split('').map(c => c.charCodeAt(0));
      });

    // command for getting door setup
    this.omegga.on('cmd:door', async (name: string, ...args: string[]) => {
      const player = this.omegga.getPlayer(name);
      if (!player) return;

      const options: DoorOptions = {};
      try {
        for (const o of args) {
          const [option, value] = o.split(':');
          switch (option) {
            case 'private':
              if (!this.config['allow-private'])
                throw 'Private doors are disabled';
              options.private = true;
              break;
            case 'oneway':
              if (!this.config['allow-one-way'])
                throw 'One-Way doors are disabled';
              options.oneway = true;
              break;
            case 'destruction':
              if (!this.config['allow-destruction'])
                throw 'Self destructing doors are disabled';
              options.destruction = true;
              break;
            case 'disabled':
              if (!this.config['allow-disabled'])
                throw 'Disabled doors are ...disabled lol?';
              options.disabled = true;
              break;
            case 'password':
            case 'pin':
              if (!this.config['allow-password'])
                throw 'Passworded doors are disabled';
              if (!value || typeof value !== 'string')
                throw 'No pin provided. use pin:1234abc';
              if (value.split('').some(c => c.charCodeAt(0) > 256))
                throw 'Unicode is not supported in pins.';
              if (value.length > 32)
                throw "Pins longer than 32 characters don't add entropy.";
              if (value === '69') this.omegga.whisper(name, 'nice.');
              options.pin = value.split('').map(c => c.charCodeAt(0));
              break;
            default:
              throw 'Unrecognized door option: ' + option.replace(/\W/g, '');
          }
        }
      } catch (err) {
        if (typeof err !== 'string')
          console.error('error parsing door options', err);
        else this.omegga.whisper(name, 'Error parsing door options: ' + err);
      }

      if (!this.isAuthorized(player.id, 'create')) {
        this.omegga.whisper(
          player,
          'You are not authorized to create doors on this server.'
        );
        return;
      }

      try {
        // start setting up a door
        const bounds = await player.getTemplateBounds();
        if (!bounds) {
          this.omegga.whisper(
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
          this.omegga.whisper(player, 'Doors this large are not supported');
          return;
        }
        if (doorBoundsSize / 10 > this.config['max-door-size']) {
          this.omegga.whisper(
            player,
            `This door is larger than the max configured size (${this.config['max-door-size']})`
          );
          return;
        }

        const data = await player.getTemplateBoundsData();

        if (!data || data.brick_count === 0) {
          this.omegga.whisper(
            player,
            'No selected bricks. Copy some bricks and move your template where you want the door to open.'
          );
          return;
        }

        if (data.brick_count > this.config['max-door-bricks']) {
          this.omegga.whisper(
            player,
            `This door contains more bricks than allowed (${this.config['max-door-bricks']})`
          );
          return;
        }

        if (data.version !== 10) {
          this.omegga.whisper(player, 'Unsupported BRS version');
          return;
        }

        // door configuration
        const ghost = await player.getGhostBrick();
        if (!ghost) {
          this.omegga.whisper(
            player,
            'Missing ghost brick. Copy some bricks and move your template where you want the door to open.'
          );
          return;
        }

        const orientation = d2o(...orientationMap[ghost.orientation]);

        const door: Partial<DoorState> = {
          extent: vecAbs(
            vecScale(vecSub(bounds.maxBound, bounds.minBound), 0.5)
          ),
          shift: vecSub(ghost.location as Vector, bounds.center),
          orientation: {
            self: d2o(4, 0),
            open: orientation,
          },
        };

        const ghostBrickDistance = Math.max(...vecAbs(door.shift));
        if (ghostBrickDistance > 65535) {
          this.omegga.whisper(
            player,
            'This door moves further than the max supported distance'
          );
          return;
        }
        if (ghostBrickDistance / 10 > this.config['max-door-shift']) {
          this.omegga.whisper(
            player,
            `This door moves further than the max configured shift (${this.config['max-door-shift']})`
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
        this.omegga.whisper(
          player,
          'You can paste these bricks. This is a <b>CLOSED</> door template. It will <b>OPEN when you click</>.'
        );
      } catch (err) {
        console.error(err);
        this.omegga.whisper(player, 'An error occured... Sorry!');
      }
    });

    const activeDoors: { center: Vector; extent: Vector }[] = [];

    // interaction handling
    this.omegga.on('interact', async ({ player, message, position }) => {
      if (!this.isAuthorized(player.id, 'use')) {
        this.omegga.whisper(
          player.name,
          'You are not authorized to use doors on this server.'
        );
        return;
      }

      if (message.length === 0) return;
      // commented out to allow everyone to interact with doors
      const match = message.match(
        /^door:(?<open>[oc]):(?<base64>(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/
      );

      let activeDoorRegion: typeof activeDoors[number];

      const cleanup = () => {
        const index = activeDoors.indexOf(activeDoorRegion);
        if (index > -1) {
          activeDoors[index] = activeDoors[activeDoors.length - 1];
          activeDoors.pop();
        }
      };

      // check if a door is active
      const checkActiveDoor = () =>
        activeDoors.some(
          ({ center, extent }) =>
            position[0] >= center[0] - extent[0] &&
            position[0] <= center[0] + extent[0] &&
            position[1] >= center[1] - extent[1] &&
            position[1] <= center[1] + extent[1] &&
            position[1] >= center[1] - extent[1] &&
            position[1] <= center[1] + extent[1]
        );

      if (checkActiveDoor()) return;

      if (match) {
        await handleAntispam(player.id);

        try {
          const open = match.groups.open === 'o';
          const state =
            (player.id in pinCache
              ? decodeDoorState(match.groups.base64, pinCache[player.id])
              : null) ?? decodeDoorState(match.groups.base64);
          if (!state) {
            this.omegga.whisper(
              player.name,
              `Unable to decode door data. Door could be encrypted${
                this.config['allow-password']
                  ? ' (<code>/doorpass p4ssw0rd</>)'
                  : ''
              } or could be from an outdated plugin.`
            );
            return;
          }

          if (state.flags.oneway && !this.config['allow-one-way']) {
            this.omegga.middlePrint(player.name, `One way doors are disabled.`);
            return;
          }

          if (state.flags.oneway && !this.config['allow-destruction']) {
            this.omegga.middlePrint(
              player.name,
              `Self destructing doors are disabled.`
            );
            return;
          }

          if (state.flags.disabled) {
            if (!this.config['allow-disabled'])
              this.omegga.middlePrint(
                player.name,
                `Disabled doors are ...disabled?`
              );
            return;
          }

          // race condition detection for when two players click a brick within the same door region
          activeDoorRegion = {
            center: position as Vector,
            extent: [
              state.brick_size,
              state.brick_size,
              state.brick_size,
            ] as Vector,
          };
          activeDoors.push(activeDoorRegion);

          // get the save data around the clicked brick
          const activeBrickData = await this.omegga.getSaveData(
            activeDoorRegion
          );

          // no bricks detected
          if (!activeBrickData || activeBrickData.bricks.length === 0) {
            cleanup();
            return console.warn(
              '[interact] no bricks detected',
              player.name,
              position,
              state.brick_size
            );
          }

          if (activeBrickData.version !== 10) {
            cleanup();
            return;
          }

          // find the clicked brick (we need to get its orientation and position)
          const brick = activeBrickData.bricks.find(b =>
            b.position.every((p, i) => position[i] === p)
          );

          if (!brick) {
            cleanup();
            return console.warn(
              '[interact] error finding active brick at',
              player.name,
              position.join(', ')
            );
          }

          const ownerId =
            activeBrickData.brick_owners[brick.owner_index - 1].id;

          if (state.flags.private) {
            // check if private doors are enabled
            if (this.config['allow-private']) {
              this.omegga.middlePrint(
                player.name,
                `Private doors are disabled.`
              );
              return;
            }

            // check if this players is the owner or the player is authorized
            if (
              ownerId !== player.id &&
              !(
                this.config['authorized-unlock'] &&
                this.isAuthorized(player.id, 'use')
              )
            ) {
              this.omegga.middlePrint(
                player.name,
                `You are not authorized to open this door.`
              );
              return;
            }
          }

          const { center, extent } = getDoorSelection(state, brick);

          const doorData = (await this.omegga.getSaveData({
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
            cleanup();
            return console.warn(
              '[interact] error finding door bricks at center:',
              player.name,
              center.join(', '),
              'extent:',
              extent.join(', ')
            );
          }

          doorData.bricks = toggleDoorState(
            open,
            state,
            brick,
            doorData.bricks
          );

          // strip console tags from this door if oneway is enabled
          if (state.flags.oneway) {
            for (const b of doorData.bricks) {
              if (b.components.BCD_Interact?.ConsoleTag.startsWith('door:')) {
                b.components.BCD_Interact.ConsoleTag = '';
              }
            }
          }

          this.omegga.writeln(
            `Bricks.ClearRegion ${center.join(' ')} ${extent.join(
              ' '
            )} ${ownerId}`
          );

          // if the door doesn't have destruction enabled (like most doors do), load the next door state
          if (!state.flags.destruction)
            await this.omegga.loadSaveData(doorData, { quiet: true });
          cleanup();
        } catch (err) {
          console.error(
            'error interacting with brick',
            player,
            message,
            position,
            err
          );
          cleanup();
        }
      }
    });

    return {
      registeredCommands: [
        this.config['allow-password'] && 'doorpass',
        this.config['allow-triggers'] && 'doortrigger',
        'door',
        DEBUG_MODE && 'g',
        DEBUG_MODE && 'o',
      ].filter(Boolean) as string[],
    };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
