import { getReorientation } from '../door';
import {
  applyRelative,
  odiff,
  oinvert,
  olookup,
  orelative,
  orientationMap2 as o,
  orientationMap2,
  orientationStr,
  orotate,
} from '../math';
import { assert, isKindaSimilar, testDoorState, testResults } from './helpers';
import { doorTests } from './tests/doors';
import { Vector } from 'omegga';

console.debug('------------ TEST ------------');

// orientation tests
assert(
  () => getReorientation(o.Z_Positive_0, o.Z_Positive_90) == o.Z_Positive_90
);
assert(
  () => getReorientation(o.Z_Positive_0, o.X_Positive_90) == o.X_Positive_90
);
assert(
  () => getReorientation(o.X_Positive_90, o.Z_Positive_0) == o.Y_Negative_0
);

// kinda similar test
assert(() => !isKindaSimilar(1, true));
assert(() => isKindaSimilar(1, 1));
assert(() => !isKindaSimilar({ a: 1 }, { b: 1 }));
assert(() => isKindaSimilar({ a: 1 }, { a: 1 }));
assert(() => isKindaSimilar({ a: 1 }, { a: 1, b: 0 }));
assert(() => !isKindaSimilar({ a: 1 }, { a: 0, b: 0 }));

// door state tests
assert(() => testDoorState(doorTests.zPositive0Setup_xPositive0Door));
assert(() => testDoorState(doorTests.zPositive0Setup_yPositive0Door));
assert(() => testDoorState(doorTests.zPositive0Setup_yNegative0Door));
assert(() => testDoorState(doorTests.zPositive90Setup_zPositive90Door));
assert(() => testDoorState(doorTests.zPositive0Setup_zPositive90Door));
assert(() => testDoorState(doorTests.zPositive0Setup_zPositive0Door));

assert(() => testDoorState(doorTests.crest_zPositive0Setup_zPositive0Door));
assert(() => testDoorState(doorTests.crest_zPositive0Setup_zPositive90Door));
assert(() => testDoorState(doorTests.crest_zPositive0Setup_yPositive0Door));
assert(() => testDoorState(doorTests.crest_zPositive0Setup_yPositive90Door));
assert(() => testDoorState(doorTests.crest_zPositive0Setup_xPositive0Door));
assert(() => testDoorState(doorTests.xPositive180Setup_zPositive270Door));
assert(() => testDoorState(doorTests.yPositive180Setup_zPositive0Door));

import './tests/relative_rotations';

testResults();

// experimenting with bulk applying an orientation to another orientation
/* const original = o.Z_Positive_0;
const rot = 'X_Positive_90';
const delta = odiff(original, o[rot]);

for (const key in o) {
  const normalized = odiff(o[key], original);
  const rotatedNormalized = orotate(normalized, delta);
  const revert = oinvert(rotatedNormalized, normalized);

  console.debug(
    `[debug] apply ${rot} on ${key} -> ${
      orientationStr[orotate(o[key], revert)]
      // orotate(o[key], o[rot])
      // orotate(o[key], orotate(original, o[rot]))
      // orotate(o[rot], odiff(original, o[key]))
      // orotate(o[key], o[rot])
    }`
  );
} */

// This code validates the rotation table
// if a test fails, either the translation table or the rotation table is wrong
// if the test passes, either both are correct or wrong

/* const {
  BRICK_CONSTANTS: { translationTable },
} = OMEGGA_UTIL.brick;

const identity: Vector = [1, 2, 3];
function invert(rotated: Vector) {
  return translationTable.findIndex(fn => fn(identity) + '' == rotated + '');
}

for (let b = 0; b < 24; b++) {
  for (let a = 0; a < 24; a++) {
    const rotated = translationTable[b](translationTable[a](identity));
    const test = invert(rotated);
    const table = orotate(a, b);
    console.debug(
      `[debug] ${orientationStr[a].padStart(14)} * ${orientationStr[b].padStart(
        14
      )} = ${orientationStr[test].padStart(14)}`,
      test !== table ? `expected ${orientationStr[table].padStart(14)}` : ''
    );
  }
}
 */
