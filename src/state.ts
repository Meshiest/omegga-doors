import { Vector } from 'omegga';
const crypto = require('crypto');

export type DoorOptions = Partial<{
  private: boolean;
  oneway: boolean;
  destruction: boolean;
  disabled: boolean;
  pin: number[];
}>;

export type DoorState = {
  // size of this brick (for saving it to get orientation)
  brick_size: number;
  // relative position of door center
  center: Vector;
  // door radius
  extent: Vector;
  // distance to shift the door
  shift: Vector;
  orientation: {
    // orientation to apply to open the door
    open: number;
    // orientation to apply to close the door
    // close: number;
    // initial orientation of this brick
    self: number;
  };
  flags: DoorOptions;
};

// 22 = 1 + 2 * 3 + 2 * 3 + 2 * 3 + 1 * 3
// extra 10 bytes are for the future!!!
const BUFFER_SIZE = 22 + 10;

// generate a new version key
/* console.debug(
  '[debug] keygen [',
  Array.from(crypto.randomBytes(BUFFER_SIZE)).join(', '),
  ']'
); */

// a version key xor is applied to every byte in the door data
// doors that do not have this version key are not compatible with this decoder
const VERSION_KEY = [
  91, 52, 247, 54, 153, 59, 158, 64, 39, 219, 119, 247, 83, 74, 48, 244, 169,
  149, 49, 119, 197, 128, 135, 117, 8, 167, 172, 74, 165, 180, 115, 181,
];

function applyPinToBuffer(buff: ArrayBuffer | Buffer, pin: number[]) {
  // apply the pin as a repeating buffer
  for (let i = 0; i < buff.byteLength; i++) {
    buff[i] ^= pin[i % pin.length];
  }
}

export function readDoorStateFromBuffer(buffer: ArrayBuffer, pin?: number[]) {
  // apply version key to the buffer
  for (let i = 0; i < buffer.byteLength && i < VERSION_KEY.length; i++)
    buffer[i] ^= VERSION_KEY[i];

  if (pin) applyPinToBuffer(buffer, pin);

  const dataview = new DataView(buffer);
  let bytes = 0;
  // version check
  if (dataview.getUint8(0) !== 111) return null;
  const state: DoorState = {
    brick_size: dataview.getUint8((bytes += 1)),
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
      self: dataview.getUint8((bytes += 1)),
    },
    flags: (() => {
      const byte = dataview.getUint8((bytes += 1));
      return {
        private: (byte & 1) > 0,
        oneway: (byte & 2) > 0,
        destruction: (byte & 4) > 0,
        disabled: (byte & 8) > 0,
      };
    })(),
  };
  return state;
}

export function writeDoorStateToBuffer(state: DoorState) {
  const buffer = new ArrayBuffer(BUFFER_SIZE);
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
  dataview.setUint8((bytes += 1), state.orientation.self);
  dataview.setUint8(
    (bytes += 1),
    (state.flags.private ? 1 : 0) |
      (state.flags.oneway ? 2 : 0) |
      (state.flags.destruction ? 4 : 0) |
      (state.flags.disabled ? 8 : 0)
  );

  if ('pin' in state.flags) applyPinToBuffer(buffer, state.flags.pin);

  // apply version key to buffer
  for (let i = 0; i < buffer.byteLength && i < VERSION_KEY.length; i++)
    buffer[i] ^= VERSION_KEY[i];

  return buffer;
}

export function decodeDoorState(encoded: string, pin?: number[]) {
  const buffer = new Uint8Array(Buffer.from(encoded, 'base64')).buffer;
  if (buffer.byteLength !== BUFFER_SIZE) return null;
  return readDoorStateFromBuffer(buffer, pin);
}

export function encodeDoorState(state: DoorState) {
  return Buffer.from(new Uint8Array(writeDoorStateToBuffer(state))).toString(
    'base64'
  );
}
