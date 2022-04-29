import { Vector } from 'omegga';

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
};

const BUFFER_SIZE = 1 + 2 * 3 + 2 * 3 + 2 * 3 + 1 * 2;
export function readDoorStateFromBuffer(buffer: ArrayBuffer) {
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
      // close: dataview.getUint8((bytes += 1)),
      self: dataview.getUint8((bytes += 1)),
    },
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
  // dataview.setUint8((bytes += 1), state.orientation.close);
  dataview.setUint8((bytes += 1), state.orientation.self);
  return buffer;
}

export function decodeDoorState(encoded: string) {
  const buffer = new Uint8Array(Buffer.from(encoded, 'base64')).buffer;
  if (buffer.byteLength !== BUFFER_SIZE) return null;
  return readDoorStateFromBuffer(buffer);
}

export function encodeDoorState(state: DoorState) {
  return Buffer.from(new Uint8Array(writeDoorStateToBuffer(state))).toString(
    'base64'
  );
}
