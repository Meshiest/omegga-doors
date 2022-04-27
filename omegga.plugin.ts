import OmeggaPlugin, { OL, PC, PS, Vector, WriteSaveObject } from 'omegga';

const {
  BRICK_CONSTANTS: { orientationMap, rotationTable, translationTable },
  d2o,
  o2d,
  getBrickSize,
  rotate: rotateBrick,
} = OMEGGA_UTIL.brick;

// code for computing the inversion and difference tables
/* const inversionTable = new Array(576).fill(0);
const differenceTable = new Array(576).fill(0);
for (const a in orientationMap) {
  const src = d2o(...orientationMap[a]);
  for (const b in orientationMap) {
    const delta = d2o(...orientationMap[b]);

    const dest = rotationTable[src * 24 + delta];
    inversionTable[dest * 24 + delta] = src;
    differenceTable[src * 24 + dest] = delta;
  }
}

console.log(JSON.stringify(inversionTable));
console.log(JSON.stringify(differenceTable));
*/

const orientationStr = Object.fromEntries(
  Object.entries(orientationMap).map(([k, v]) => [d2o(...v), k])
);

const inversionTable = [
  16, 19, 18, 17, 22, 23, 20, 21, 9, 1, 13, 5, 15, 7, 11, 3, 0, 12, 4, 8, 6, 10,
  2, 14, 17, 16, 19, 18, 23, 20, 21, 22, 10, 2, 14, 6, 12, 4, 8, 0, 1, 13, 5, 9,
  7, 11, 3, 15, 18, 17, 16, 19, 20, 21, 22, 23, 11, 3, 15, 7, 13, 5, 9, 1, 2,
  14, 6, 10, 4, 8, 0, 12, 19, 18, 17, 16, 21, 22, 23, 20, 8, 0, 12, 4, 14, 6,
  10, 2, 3, 15, 7, 11, 5, 9, 1, 13, 22, 23, 20, 21, 16, 19, 18, 17, 15, 7, 11,
  3, 9, 1, 13, 5, 4, 8, 0, 12, 2, 14, 6, 10, 23, 20, 21, 22, 17, 16, 19, 18, 12,
  4, 8, 0, 10, 2, 14, 6, 5, 9, 1, 13, 3, 15, 7, 11, 20, 21, 22, 23, 18, 17, 16,
  19, 13, 5, 9, 1, 11, 3, 15, 7, 6, 10, 2, 14, 0, 12, 4, 8, 21, 22, 23, 20, 19,
  18, 17, 16, 14, 6, 10, 2, 8, 0, 12, 4, 7, 11, 3, 15, 1, 13, 5, 9, 15, 7, 11,
  3, 9, 1, 13, 5, 16, 19, 18, 17, 22, 23, 20, 21, 8, 0, 12, 4, 10, 2, 14, 6, 12,
  4, 8, 0, 10, 2, 14, 6, 17, 16, 19, 18, 23, 20, 21, 22, 9, 1, 13, 5, 11, 3, 15,
  7, 13, 5, 9, 1, 11, 3, 15, 7, 18, 17, 16, 19, 20, 21, 22, 23, 10, 2, 14, 6, 8,
  0, 12, 4, 14, 6, 10, 2, 8, 0, 12, 4, 19, 18, 17, 16, 21, 22, 23, 20, 11, 3,
  15, 7, 9, 1, 13, 5, 9, 1, 13, 5, 15, 7, 11, 3, 22, 23, 20, 21, 16, 19, 18, 17,
  12, 4, 8, 0, 14, 6, 10, 2, 10, 2, 14, 6, 12, 4, 8, 0, 23, 20, 21, 22, 17, 16,
  19, 18, 13, 5, 9, 1, 15, 7, 11, 3, 11, 3, 15, 7, 13, 5, 9, 1, 20, 21, 22, 23,
  18, 17, 16, 19, 14, 6, 10, 2, 12, 4, 8, 0, 8, 0, 12, 4, 14, 6, 10, 2, 21, 22,
  23, 20, 19, 18, 17, 16, 15, 7, 11, 3, 13, 5, 9, 1, 0, 12, 4, 8, 2, 14, 6, 10,
  3, 15, 7, 11, 1, 13, 5, 9, 16, 19, 18, 17, 20, 21, 22, 23, 1, 13, 5, 9, 3, 15,
  7, 11, 0, 12, 4, 8, 2, 14, 6, 10, 17, 16, 19, 18, 21, 22, 23, 20, 2, 14, 6,
  10, 0, 12, 4, 8, 1, 13, 5, 9, 3, 15, 7, 11, 18, 17, 16, 19, 22, 23, 20, 21, 3,
  15, 7, 11, 1, 13, 5, 9, 2, 14, 6, 10, 0, 12, 4, 8, 19, 18, 17, 16, 23, 20, 21,
  22, 6, 10, 2, 14, 4, 8, 0, 12, 7, 11, 3, 15, 5, 9, 1, 13, 20, 21, 22, 23, 16,
  19, 18, 17, 7, 11, 3, 15, 5, 9, 1, 13, 4, 8, 0, 12, 6, 10, 2, 14, 21, 22, 23,
  20, 17, 16, 19, 18, 4, 8, 0, 12, 6, 10, 2, 14, 5, 9, 1, 13, 7, 11, 3, 15, 22,
  23, 20, 21, 18, 17, 16, 19, 5, 9, 1, 13, 7, 11, 3, 15, 6, 10, 2, 14, 4, 8, 0,
  12, 23, 20, 21, 22, 19, 18, 17, 16,
];

const differenceTable = [
  16, 15, 22, 9, 18, 11, 20, 13, 17, 3, 21, 5, 19, 7, 23, 1, 0, 8, 4, 12, 6, 10,
  2, 14, 9, 16, 15, 22, 13, 18, 11, 20, 5, 17, 3, 21, 1, 19, 7, 23, 12, 0, 8, 4,
  14, 6, 10, 2, 22, 9, 16, 15, 20, 13, 18, 11, 21, 5, 17, 3, 23, 1, 19, 7, 4,
  12, 0, 8, 2, 14, 6, 10, 15, 22, 9, 16, 11, 20, 13, 18, 3, 21, 5, 17, 7, 23, 1,
  19, 8, 4, 12, 0, 10, 2, 14, 6, 18, 13, 20, 11, 16, 9, 22, 15, 19, 1, 23, 7,
  17, 5, 21, 3, 2, 10, 6, 14, 4, 8, 0, 12, 11, 18, 13, 20, 15, 16, 9, 22, 7, 19,
  1, 23, 3, 17, 5, 21, 14, 2, 10, 6, 12, 4, 8, 0, 20, 11, 18, 13, 22, 15, 16, 9,
  23, 7, 19, 1, 21, 3, 17, 5, 6, 14, 2, 10, 0, 12, 4, 8, 13, 20, 11, 18, 9, 22,
  15, 16, 1, 23, 7, 19, 5, 21, 3, 17, 10, 6, 14, 2, 8, 0, 12, 4, 19, 14, 21, 8,
  17, 10, 23, 12, 16, 2, 20, 4, 18, 6, 22, 0, 3, 11, 7, 15, 5, 9, 1, 13, 8, 19,
  14, 21, 12, 17, 10, 23, 4, 16, 2, 20, 0, 18, 6, 22, 15, 3, 11, 7, 13, 5, 9, 1,
  21, 8, 19, 14, 23, 12, 17, 10, 20, 4, 16, 2, 22, 0, 18, 6, 7, 15, 3, 11, 1,
  13, 5, 9, 14, 21, 8, 19, 10, 23, 12, 17, 2, 20, 4, 16, 6, 22, 0, 18, 11, 7,
  15, 3, 9, 1, 13, 5, 17, 12, 23, 10, 19, 8, 21, 14, 18, 0, 22, 6, 16, 4, 20, 2,
  1, 9, 5, 13, 7, 11, 3, 15, 10, 17, 12, 23, 14, 19, 8, 21, 6, 18, 0, 22, 2, 16,
  4, 20, 13, 1, 9, 5, 15, 7, 11, 3, 23, 10, 17, 12, 21, 14, 19, 8, 22, 6, 18, 0,
  20, 2, 16, 4, 5, 13, 1, 9, 3, 15, 7, 11, 12, 23, 10, 17, 8, 21, 14, 19, 0, 22,
  6, 18, 4, 20, 2, 16, 9, 5, 13, 1, 11, 3, 15, 7, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 3, 0, 1, 2, 7, 4, 5,
  6, 11, 8, 9, 10, 15, 12, 13, 14, 19, 16, 17, 18, 23, 20, 21, 22, 2, 3, 0, 1,
  6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13, 18, 19, 16, 17, 22, 23, 20, 21, 1,
  2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8, 13, 14, 15, 12, 17, 18, 19, 16, 21, 22, 23,
  20, 6, 5, 4, 7, 2, 1, 0, 3, 14, 13, 12, 15, 10, 9, 8, 11, 20, 23, 22, 21, 16,
  19, 18, 17, 7, 6, 5, 4, 3, 2, 1, 0, 15, 14, 13, 12, 11, 10, 9, 8, 21, 20, 23,
  22, 17, 16, 19, 18, 4, 7, 6, 5, 0, 3, 2, 1, 12, 15, 14, 13, 8, 11, 10, 9, 22,
  21, 20, 23, 18, 17, 16, 19, 5, 4, 7, 6, 1, 0, 3, 2, 13, 12, 15, 14, 9, 8, 11,
  10, 23, 22, 21, 20, 19, 18, 17, 16,
];

type Config = {};
type Storage = {};

type DoorState = {
  brick_size: number;
  center: Vector;
  extent: Vector;
  shift: Vector;
  orientation: { open: number; close: number };
};

const vecStr = (a: number[]) => `[ ${a.join(', ')} ]`;

const vecAdd = (a: Vector, b: Vector): Vector => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const vecScale = (a: Vector, s: number): Vector => [
  a[0] * s,
  a[1] * s,
  a[2] * s,
];

const vecAbs = (a: Vector): Vector => [
  Math.abs(a[0]),
  Math.abs(a[1]),
  Math.abs(a[2]),
];

const vecSub = (a: Vector, b: Vector): Vector => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

function readDoorStateFromBuffer(buffer: ArrayBuffer) {
  const dataview = new DataView(buffer);
  let bytes = 0;
  const state: DoorState = {
    brick_size: dataview.getUint8(0),
    center: [
      dataview.getInt16((bytes += 1)),
      dataview.getInt16((bytes += 2)),
      dataview.getInt16((bytes += 2)),
    ],
    extent: [
      dataview.getUint16((bytes += 2)),
      dataview.getUint16((bytes += 2)),
      dataview.getUint16((bytes += 2)),
    ],
    shift: [
      dataview.getInt16((bytes += 2)),
      dataview.getInt16((bytes += 2)),
      dataview.getInt16((bytes += 2)),
    ],
    orientation: {
      open: dataview.getUint8((bytes += 2)),
      close: dataview.getUint8((bytes += 1)),
    },
  };
  return state;
}

function writeDoorStateToBuffer(state: DoorState) {
  const buffer = new ArrayBuffer(22);
  const dataview = new DataView(buffer);
  let bytes = 0;
  dataview.setUint8(0, state.brick_size);
  dataview.setInt16((bytes += 1), state.center[0]);
  dataview.setInt16((bytes += 2), state.center[1]);
  dataview.setInt16((bytes += 2), state.center[2]);
  dataview.setUint16((bytes += 2), state.extent[0]);
  dataview.setUint16((bytes += 2), state.extent[1]);
  dataview.setUint16((bytes += 2), state.extent[2]);
  dataview.setInt16((bytes += 2), state.shift[0]);
  dataview.setInt16((bytes += 2), state.shift[1]);
  dataview.setInt16((bytes += 2), state.shift[2]);
  dataview.setUint8((bytes += 2), state.orientation.open);
  dataview.setUint8((bytes += 1), state.orientation.close);
  return buffer;
}

enum SetupStage {
  FirstDoor,
  SecondDoor,
}

function decodeDoorState(encoded: string) {
  const buffer = new Uint8Array(Buffer.from(encoded, 'base64')).buffer;
  if (buffer.byteLength !== 22) return null;
  return readDoorStateFromBuffer(buffer);
}

function encodeDoorState(state: DoorState) {
  return Buffer.from(new Uint8Array(writeDoorStateToBuffer(state))).toString(
    'base64'
  );
}

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
          // stage: SetupStage.FirstDoor,
          bounds,
          data,
          start: bounds.center,
          orientation: d2o(4, 0),
          stage: SetupStage.SecondDoor,
        };

        const door: DoorState = {
          center: null,
          brick_size: 0,
          extent: vecAbs(
            vecScale(vecSub(state.bounds.maxBound, state.bounds.minBound), 0.5)
          ),
          shift: translationTable[
            inversionTable[d2o(4, 0) * 24 + state.orientation]
          ](vecSub(ghost.location as Vector, state.start)),
          orientation: {
            open: differenceTable[state.orientation * 24 + orientation],
            close: differenceTable[orientation * 24 + state.orientation],
          },
        };

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
            translationTable[inversionTable[d2o(4, 0) * 24 + brickOrientation]];

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
              // unrotate the door open/close rotations based on the brick's rotation
              // so when the door is opened, it can be applied based on the brick's orientation
              open: door.orientation.open,
              close: door.orientation.close,
              /* close:
                      inversionTable[
                        door.orientation.close * 24 + brickOrientation
                      ], */
            },
            extent: vecAbs(translate(door.extent)),
            shift: translate(door.shift),
            center: translate(vecSub(state.bounds.center, brick.position)),
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

    /* console.debug(
      decodeDoorState(
        encodeDoorState({
          center: [50000, 0, -5],
          extent: [0, 300, 5],
          shift: [5, 0, 30],
          open: true,
          orientation: 5,
        })
      )
    ); */

    this.omegga.on('interact', async ({ player, message, position }) => {
      if (message.length === 0) return;
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
          /* console.debug(
            '[debug] state',
            open,
            `{
  brick_size: ${state.brick_size},
  center: ${vecStr(state.center)},
  extent: ${vecStr(state.extent)},
  shift: ${vecStr(state.shift)},
  orientation:
    open: ${orientationStr[state.orientation.open]},
    close: ${orientationStr[state.orientation.close]},
}`
          ); */

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

          const activeBrickData = await this.omegga.getSaveData(
            activeDoorRegion
          );

          // no bricks detected
          if (!activeBrickData || activeBrickData.bricks.length === 0) {
            cleanup();
            return console.warn(
              '[interact] no bricks detected',
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
              position.join(', ')
            );
          }

          const ownerId =
            activeBrickData.brick_owners[brick.owner_index - 1].id;

          const brickOrientation = d2o(brick.direction, brick.rotation);

          // translation function to map stored relative position to world position
          const translateMeta =
            translationTable[rotationTable[d2o(4, 0) * 24 + brickOrientation]];

          // apply the reoriented door center to the brick's position
          const center = vecAdd(translateMeta(state.center), position);
          const extent = vecAbs(translateMeta(state.extent));
          let shift = translateMeta(state.shift);
          // when the door is open, apply the open translation to the shift
          if (open) shift = translationTable[state.orientation.close](shift);

          const doorData = (await this.omegga.getSaveData({
            center,
            extent,
          })) as WriteSaveObject;

          if (doorData?.bricks) {
            doorData.bricks = doorData.bricks.filter(
              b => doorData.brick_owners[b.owner_index - 1].id === ownerId
            );
          }

          if (!doorData || doorData.bricks.length === 0) {
            cleanup();
            return console.warn(
              '[interact] error finding door bricks at center:',
              center.join(', '),
              'extent:',
              extent.join(', ')
            );
          }

          const doorOrientation = state.orientation[open ? 'close' : 'open'];
          // const doorOrientation =
          //   inversionTable[
          //     state.orientation[open ? 'close' : 'open'] * 24 + brickOrientation
          //   ];
          const doorDirection = o2d(doorOrientation) as [number, number];

          // door center position (shifted)
          const shiftedCenter = vecAdd(center, vecScale(shift, open ? -1 : 1));
          // const shiftedCenter = vecAdd(center, shift);

          for (let i = 0; i < doorData.bricks.length; i++) {
            let brick = doorData.bricks[i];
            // center the bricks based on door position
            brick.position = vecSub(brick.position, center);
            // rotate the brick
            brick = rotateBrick(brick, doorDirection);
            // move the brick to the destination of the door
            brick.position = vecAdd(brick.position, shiftedCenter);

            // update the component
            if (
              brick.components.BCD_Interact &&
              brick.components.BCD_Interact.ConsoleTag?.startsWith('door:')
            ) {
              // swap door ConsoleTag open state
              brick.components.BCD_Interact.ConsoleTag =
                brick.components.BCD_Interact.ConsoleTag.replace(
                  `door:${open ? 'o' : 'c'}:`,
                  `door:${open ? 'c' : 'o'}:`
                );
            }
            doorData.bricks[i] = brick;
          }

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

    return { registeredCommands: ['door'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
