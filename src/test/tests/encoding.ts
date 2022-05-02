import { decodeDoorState, DoorState, encodeDoorState } from 'src/state';
import { assert, isKindaSimilar } from '../helpers';

const state: DoorState = {
  brick_size: 0,
  center: [0, 0, 0],
  extent: [0, 0, 0],
  shift: [0, 0, 0],
  orientation: {
    open: 0,
    self: 0,
  },
  flags: {
    destruction: false,
    disabled: false,
    oneway: false,
    private: false,
  },
};

assert(() => encodeDoorState(state).length + 'door:o:'.length < 50);
assert(() => {
  const encoded = encodeDoorState(state);
  const decoded = decodeDoorState(encoded);

  return isKindaSimilar(state, decoded, true);
}, 'zeroes');

assert(() => {
  const state: DoorState = {
    brick_size: 1,
    center: [1, 1, 1],
    extent: [1, 1, 1],
    shift: [1, 1, 1],
    orientation: {
      open: 1,
      self: 1,
    },
    flags: {
      destruction: true,
      disabled: true,
      oneway: true,
      private: true,
    },
  };
  const encoded = encodeDoorState(state);
  const decoded = decodeDoorState(encoded);

  return isKindaSimilar(state, decoded, true);
}, 'ones');

assert(() => {
  const state: DoorState = {
    brick_size: 1,
    center: [1, 1, 1],
    extent: [1, 1, 1],
    shift: [1, 1, 1],
    orientation: {
      open: 1,
      self: 1,
    },
    flags: {
      destruction: true,
      disabled: true,
      oneway: true,
      private: true,
      pin: [97, 32, 58, 11],
    },
  };
  const encoded = encodeDoorState(state);
  const decoded = decodeDoorState(encoded, state.flags.pin);

  return isKindaSimilar(state, decoded, true);
}, 'pin');
