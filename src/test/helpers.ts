import { toggleDoorState } from 'src/door';
import { DoorTest } from './types';

const printDebug = (a: any, b: any, path: string = '.') =>
  console.debug(
    `[kinda similar] ${path} ~~ ${JSON.stringify(a)} != ${JSON.stringify(b)}`
  );

export function isKindaSimilar(
  a: any,
  b: any,
  print?: boolean,
  path: string = '.'
) {
  if (a === b) return true;
  if (typeof a !== typeof b) {
    if (print) printDebug(a, b, path);
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      if (print) printDebug(a, b, path);
      return false;
    }
    if (a.length !== b.length) {
      if (print) printDebug(a, b, path);
      return false;
    }
    return a.every((item, i) =>
      isKindaSimilar(item, b[i], print ?? false, (path ?? '') + `[${i}]`)
    );
  }

  if (typeof a === 'object') {
    for (const key in a) {
      if (!(key in b)) {
        if (print) printDebug(a, b, path);
        return false;
      }
      if (
        !isKindaSimilar(
          a[key],
          b[key],
          print ?? false,
          (path ?? '') + '.' + key
        )
      ) {
        return false;
      }
    }
  } else {
    if (print) printDebug(a, b, path);
    return false;
  }

  return true;
}

export function testDoorState(test: DoorTest) {
  const { state, open, closed } = test;
  // compute opened door bricks from closed door state
  const bOpen = toggleDoorState(
    false,
    state,
    closed.clickedBrick,
    closed.bricks
  );

  // compute closed door bricks from opened door state
  const bClose = toggleDoorState(true, state, open.clickedBrick, open.bricks);

  const openedOk = open.bricks
    .flatMap((b, i) => [
      isKindaSimilar(bOpen[i].position, b.position, true, `OP[${i}].pos`),
      isKindaSimilar(bOpen[i].rotation, b.rotation, true, `OP[${i}].rot`),
      isKindaSimilar(bOpen[i].direction, b.direction, true, `OP[${i}].dir`),
    ])
    .every(Boolean);

  const closedOk = closed.bricks
    .flatMap((b, i) => [
      isKindaSimilar(bClose[i].position, b.position, true, `cl[${i}].pos`),
      isKindaSimilar(bClose[i].rotation, b.rotation, true, `cl[${i}].rot`),
      isKindaSimilar(bClose[i].direction, b.direction, true, `cl[${i}].dir`),
    ])
    .every(Boolean);

  // test the results
  return openedOk && closedOk;
}

let count = 0;
let failed = 0;
export function assert(condition: () => boolean, label?: string) {
  count++;
  if (!condition()) {
    failed++;
    console.debug(
      `[test] failed #${count}:`,
      label ?? '',
      condition.toString()
    );
  }
}

export function testResults() {
  console.debug(`[test] passed ${count - failed}/${count} tests.`);
}
