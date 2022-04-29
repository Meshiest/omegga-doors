import { Brick, Vector } from 'omegga';
import {
  applyRelative,
  odiff,
  oinvert,
  orientationStr,
  orotate,
  vecAbs,
  vecAdd,
  vecScale,
  vecStr,
  vecSub,
} from './math';
import { DoorState } from './state';

const {
  BRICK_CONSTANTS: { translationTable },
  d2o,
  o2d,
  rotate: rotateBrick,
} = OMEGGA_UTIL.brick;

/**
 * as the data stored in the console tag is relative, the "reorient"
 * can be used to reorient the door center/extent positions.
 * reorient should be used as `rotation[src * 24 + reorient]`
 */
export function getReorientation(
  selfOrientation: number,
  clickedOrientation: number
) {
  return odiff(
    // "self" is relative to Z_Positive_0
    selfOrientation,
    // brick orientation is the destination
    clickedOrientation
  );
}

/** get the door's center relative to the clicked brick */
function getDoorCenter(
  reorient: number,
  relativeCenter: Vector,
  clickedPosition: Vector
) {
  return vecAdd(translationTable[reorient](relativeCenter), clickedPosition);
}

/** given a clicked brick and its door state (relative positions and orientations),
 * determine the area around the brick needed for getting the door bricks*/
export function getDoorSelection(state: DoorState, clickedBrick: Brick) {
  const reorient = getReorientation(
    state.orientation.self,
    d2o(clickedBrick.direction, clickedBrick.rotation)
  );

  return {
    center: getDoorCenter(reorient, state.center, clickedBrick.position),
    extent: vecAbs(translationTable[reorient](state.extent)),
  };
}

/** move bricks given a door center, door shift, and rotation */
export function moveDoorBricks(
  open: boolean,
  center: Vector,
  shift: Vector,
  orientation: number,
  bricks: Brick[]
): Brick[] {
  const direction = o2d(orientation) as [number, number];

  // make a copy of the bricks array
  bricks = [...bricks];
  for (let i = 0; i < bricks.length; i++) {
    // make a copy of the bricks
    let brick = { ...bricks[i] };
    // center the bricks based on door position
    brick.position = vecSub(brick.position, center);
    // rotate the brick
    brick = rotateBrick(brick, direction);
    // move the brick to the destination of the door
    brick.position = vecAdd(brick.position, vecAdd(center, shift));

    // update the component
    if (
      brick.components?.BCD_Interact &&
      brick.components?.BCD_Interact.ConsoleTag?.startsWith('door:')
    ) {
      // swap door ConsoleTag open state
      brick.components.BCD_Interact.ConsoleTag =
        brick.components.BCD_Interact.ConsoleTag.replace(
          `door:${open ? 'o' : 'c'}:`,
          `door:${open ? 'c' : 'o'}:`
        );
    }
    bricks[i] = brick;
  }
  return bricks;
}

export function toggleDoorState(
  open: boolean,
  state: DoorState,
  clickedBrick: Brick,
  bricks: Brick[]
) {
  const brickOrientation = d2o(clickedBrick.direction, clickedBrick.rotation);

  const targetOrientation = applyRelative(
    d2o(4, 0),
    open ? odiff(state.orientation.open, d2o(4, 0)) : state.orientation.open,
    brickOrientation
  );

  const doorOrientation = odiff(brickOrientation, targetOrientation);

  const reorient = getReorientation(
    state.orientation.self,
    d2o(clickedBrick.direction, clickedBrick.rotation)
  );
  const center = getDoorCenter(reorient, state.center, clickedBrick.position);

  const shift = translationTable[
    open ? oinvert(reorient, state.orientation.open) : reorient
  ](state.shift);

  if (clickedBrick.components) {
    console.log(
      '{\nstate:',
      JSON.stringify(state),
      `,${open ? 'open' : 'closed'}:{`,
      '\nclickedBrick:',
      `{ position: ${vecStr(clickedBrick.position)}, size: ${vecStr(
        clickedBrick.size
      )}, rotation: ${clickedBrick.rotation}, direction: ${
        clickedBrick.direction
      }},`,
      '\nbricks:[',
      bricks
        .map(
          b =>
            `{ position: ${vecStr(b.position)}, size: ${vecStr(
              b.size
            )}, rotation: ${b.rotation}, direction: ${b.direction}}`
        )
        .join(',\n'),
      ']}}'
    );
  }

  return moveDoorBricks(
    open,
    center,
    vecScale(shift, open ? -1 : 1),
    doorOrientation,
    bricks
  );
}
