import OmeggaPlugin, { OL, PC, PS, Vector, WriteSaveObject } from 'omegga';
import { getDoorSelection, toggleDoorState } from 'src/door';
import {
  applyTable,
  differenceTable,
  inversionTable,
  orientationStr,
  vecAbs,
  vecScale,
  vecSub,
} from 'src/math';
import { decodeDoorState, DoorState, encodeDoorState } from 'src/state';
import 'src/test';

const {
  BRICK_CONSTANTS: { orientationMap, rotationTable, translationTable },
  d2o,
  getBrickSize,
} = OMEGGA_UTIL.brick;

type Config = {};
type Storage = {};

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  activeDoors: { center: Vector; extent: Vector }[];

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    this.activeDoors = [];
  }

  async init() {
    this.omegga.on('cmd:g', async (name: string) => {
      const g = await this.omegga.getPlayer(name).getGhostBrick();
      this.omegga.whisper(name, g.orientation);
    });
    // command for getting door setup
    this.omegga.on('cmd:door', async (name: string, next: string) => {
      const player = this.omegga.getPlayer(name);
      if (!player) return;
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

        if (Math.max(...vecSub(bounds.maxBound, bounds.minBound)) > 65534) {
          // make sure door bounds are small enough
          this.omegga.whisper(player, 'Doors this large are not supported');
          return;
        }

        const data = await player.getTemplateBoundsData();

        if (!data || data.bricks.length === 0) {
          this.omegga.whisper(
            player,
            'No selected bricks. Copy some bricks and move your template where you want the door to open.'
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

        const state = {
          bounds,
          data,
          start: bounds.center,
          orientation: d2o(4, 0),
        };

        const door: DoorState = {
          center: null,
          brick_size: 0,
          extent: vecAbs(
            vecScale(vecSub(state.bounds.maxBound, state.bounds.minBound), 0.5)
          ),
          shift: vecSub(ghost.location as Vector, state.start),
          orientation: {
            self: d2o(4, 0),
            open: orientation,
            // close: applyTable(differenceTable, orientation, state.orientation),
          },
        };

        if (name === 'cake') {
          console.debug(
            `[debug] new door:
            targetOpen: ${orientationStr[door.orientation.open]}
            ghost orientation: ${orientationStr[orientation]}
          `
          );
        }

        if (Math.max(...door.shift) > 60000) {
          this.omegga.whisper(
            player,
            'Doors this far apart are not supported.'
          );
          return;
        }

        for (const brick of state.data.bricks) {
          const brickOrientation = d2o(brick.direction, brick.rotation);

          // all translations are relative to up
          const translate =
            translationTable[
              applyTable(inversionTable, d2o(4, 0), brickOrientation)
            ];

          brick.components.BCD_Interact ??= {
            bPlayInteractSound: false,
            Message: '',
            ConsoleTag: '',
          };

          brick.components.BCD_Interact.ConsoleTag = `door:c:${encodeDoorState({
            brick_size: Math.max(
              ...(getBrickSize(brick, state.data.brick_assets) ?? [0])
            ),
            orientation: {
              open: door.orientation.open,
              // close: door.orientation.close,
              self: brickOrientation,
            },
            extent: door.extent,
            shift: door.shift,
            center: vecSub(state.bounds.center, brick.position),
          })}`;
        }
        delete state.data.components;

        await player.loadSaveData(state.data);
        this.omegga.whisper(
          player,
          'You can paste these bricks. This is a <b>CLOSED</> door template. It will <b>OPEN when you click</>.'
        );
      } catch (err) {
        console.error(err);
        this.omegga.whisper(player, 'An error occured... Sorry!');
      }
    });

    // interaction handling
    this.omegga.on('interact', async ({ player, message, position }) => {
      if (message.length === 0) return;
      // commented out to allow everyone to interact with doors
      // if (!['cake', 'x', 'Zeblote', 'Aware'].includes(player.name)) return;
      const match = message.match(
        /^door:(?<open>[oc]):(?<base64>(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/
      );

      let activeDoorRegion: typeof this.activeDoors[number];

      const cleanup = () => {
        const index = this.activeDoors.indexOf(activeDoorRegion);
        if (index > -1) {
          this.activeDoors[index] =
            this.activeDoors[this.activeDoors.length - 1];
          this.activeDoors.pop();
        }
      };

      // check if a door is active
      const checkActiveDoor = () =>
        this.activeDoors.some(
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
        try {
          const open = match.groups.open === 'o';
          const state = decodeDoorState(match.groups.base64);
          if (!state) return;

          // race condition detection for when two players click a brick within the same door region
          activeDoorRegion = {
            center: position as Vector,
            extent: [
              state.brick_size,
              state.brick_size,
              state.brick_size,
            ] as Vector,
          };
          this.activeDoors.push(activeDoorRegion);

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

          this.omegga.writeln(
            `Bricks.ClearRegion ${center.join(' ')} ${extent.join(
              ' '
            )} ${ownerId}`
          );

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

    return { registeredCommands: ['door', 'g'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
