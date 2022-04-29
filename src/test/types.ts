import { Vector } from 'omegga';
import { DoorState } from 'src/state';

export type FakeBrick = {
  position: Vector;
  size: Vector;
  rotation: number;
  direction: number;
};

export type DoorSnapshot = {
  clickedBrick: FakeBrick;
  bricks: FakeBrick[];
};

export type DoorTest = {
  state: DoorState;
  closed: DoorSnapshot;
  open: DoorSnapshot;
};
