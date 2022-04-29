import { applyRelative, orelative, orientationMap2 as o } from 'src/math';
import { assert, isKindaSimilar } from '../helpers';

// z positive 90 rotations on all orientations
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.X_Positive_0),
    o.X_Positive_90
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.Y_Positive_0),
    o.Y_Positive_90
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.Z_Positive_0),
    o.Z_Positive_90
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.X_Negative_0),
    o.X_Negative_90
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.Y_Negative_0),
    o.Y_Negative_90
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Z_Positive_90, o.Z_Negative_0),
    o.Z_Negative_90
  )
);

// Y Positive 90 rotations (roll forwards)
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Y_Positive_90, o.X_Negative_0),
    o.Y_Positive_0
  )
);
assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Y_Positive_90, o.Z_Negative_90),
    o.X_Positive_270
  )
);

assert(() =>
  isKindaSimilar(
    applyRelative(o.Z_Positive_0, o.Y_Positive_90, o.Z_Negative_90),
    o.X_Positive_270
  )
);
