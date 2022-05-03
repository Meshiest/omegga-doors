import { Vector } from 'omegga';

export type DoorOptions = Partial<{
  private: boolean;
  oneway: boolean;
  destruction: boolean;
  disabled: boolean;
  resettable: boolean;
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
const BUFFER_SIZE = 22 + 8;

// generate a new version key
// don't forget to add/remove crypto from access.json
/*
const crypto = require('crypto');
console.debug(
  'keygen [',
  Array.from(crypto.randomBytes(BUFFER_SIZE)).join(', '),
  ']'
); */

// a version key xor is applied to every byte in the door data
// doors that do not have this version key are not compatible with this decoder
const VERSION_KEY = [
  91, 52, 247, 54, 153, 59, 158, 64, 39, 219, 119, 247, 83, 74, 48, 244, 169,
  149, 49, 119, 197, 128, 135, 117, 8, 167, 172, 74, 165, 180,
];

function applyPinToBuffer(dataview: DataView, pin: number[]) {
  // apply the pin as a repeating buffer
  for (let i = 0; i < dataview.byteLength; i++) {
    dataview.setUint8(i, dataview.getUint8(i) ^ pin[i % pin.length]);
  }
}

export function readDoorStateFromBuffer(buffer: ArrayBuffer, pin?: number[]) {
  let parity = 0;

  const dataview = new DataView(buffer);

  // apply version key to the buffer
  for (let i = buffer.byteLength - 1; i >= 0 && i < VERSION_KEY.length; i--) {
    dataview.setUint8(
      i,
      dataview.getUint8(i) ^
        VERSION_KEY[i] ^
        (i > 0 ? dataview.getUint8(i - 1) : 0)
    );
  }

  if (pin) applyPinToBuffer(dataview, pin);

  for (let i = 0; i < buffer.byteLength; i++) {
    if (i !== 1) parity ^= dataview.getUint8(i);
  }

  // parity failure
  if (parity !== dataview.getUint8(1)) {
    return null;
  }

  let bytes = 1;
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
        resettable: (byte & 16) > 0,
        pin,
      };
    })(),
  };
  return state;
}

export function writeDoorStateToBuffer(state: DoorState) {
  const buffer = new ArrayBuffer(BUFFER_SIZE);
  const dataview = new DataView(buffer);
  let bytes = 0;
  // 0th byte is version
  dataview.setUint8(0, 111);
  // 1st byte is parity
  bytes += 1;
  dataview.setUint8((bytes += 1), state.brick_size);
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
    (state.flags?.private ? 1 : 0) |
      (state.flags?.oneway ? 2 : 0) |
      (state.flags?.destruction ? 4 : 0) |
      (state.flags?.disabled ? 8 : 0) |
      (state.flags?.resettable ? 16 : 0)
  );

  let parity = 0;
  for (let i = 0; i < buffer.byteLength; i++) {
    if (i !== 1) parity ^= dataview.getUint8(i);
  }
  dataview.setUint8(1, parity);

  if ('pin' in state?.flags && state.flags.pin)
    applyPinToBuffer(dataview, state.flags.pin);

  // apply version key to buffer
  for (let i = 0; i < buffer.byteLength && i < VERSION_KEY.length; i++) {
    dataview.setUint8(
      i,
      dataview.getUint8(i) ^
        VERSION_KEY[i] ^
        (i > 0 ? dataview.getUint8(i - 1) : 0)
    );
  }

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
