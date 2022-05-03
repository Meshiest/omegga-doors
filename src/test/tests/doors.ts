import { DoorTest } from '../types';

export const doorTests: Record<string, DoorTest> = {
  zPositive0Setup_zPositive0Door: {
    state: {
      brick_size: 15,
      center: [0, 0, -16],
      extent: [5, 15, 30],
      shift: [10, -10, 0],
      orientation: { open: 19, self: 16 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-325, 295, 46],
        size: [5, 15, 14],
        rotation: 0,
        direction: 4,
      },
      bricks: [
        {
          position: [-325, 295, 14],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-329, 305, 30],
          size: [1, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-324, 305, 30],
          size: [4, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-325, 290, 30],
          size: [10, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-325, 295, 46],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-315, 285, 46],
        size: [5, 15, 14],
        rotation: 3,
        direction: 4,
      },
      bricks: [
        {
          position: [-315, 285, 14],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-305, 289, 30],
          size: [1, 5, 2],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-305, 284, 30],
          size: [4, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-320, 285, 30],
          size: [10, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-315, 285, 46],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
      ],
    },
  },
  zPositive0Setup_zPositive90Door: {
    state: {
      brick_size: 15,
      center: [0, 0, -16],
      extent: [5, 15, 30],
      shift: [10, -10, 0],
      orientation: { open: 19, self: 16 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-285, -345, 46],
        size: [5, 15, 14],
        rotation: 1,
        direction: 4,
      },
      bricks: [
        {
          position: [-285, -345, 14],
          size: [5, 15, 14],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-295, -349, 30],
          size: [1, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-295, -344, 30],
          size: [4, 5, 2],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-280, -345, 30],
          size: [10, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-285, -345, 46],
          size: [5, 15, 14],
          rotation: 1,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-275, -335, 46],
        size: [5, 15, 14],
        rotation: 0,
        direction: 4,
      },
      bricks: [
        {
          position: [-275, -335, 14],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-279, -325, 30],
          size: [1, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-274, -325, 30],
          size: [4, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-275, -340, 30],
          size: [10, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-275, -335, 46],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
      ],
    },
  },
  zPositive90Setup_zPositive90Door: {
    state: {
      brick_size: 15,
      center: [0, 0, -16],
      extent: [15, 5, 30],
      shift: [10, 10, 0],
      orientation: { open: 19, self: 17 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-375, -345, 46],
        size: [5, 15, 14],
        rotation: 1,
        direction: 4,
      },
      bricks: [
        {
          position: [-375, -345, 14],
          size: [5, 15, 14],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-385, -349, 30],
          size: [1, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-385, -344, 30],
          size: [4, 5, 2],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-370, -345, 30],
          size: [10, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-375, -345, 46],
          size: [5, 15, 14],
          rotation: 1,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-365, -335, 46],
        size: [5, 15, 14],
        rotation: 0,
        direction: 4,
      },
      bricks: [
        {
          position: [-365, -335, 14],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-369, -325, 30],
          size: [1, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-364, -325, 30],
          size: [4, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-365, -340, 30],
          size: [10, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-365, -335, 46],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
      ],
    },
  },
  zPositive0Setup_xPositive0Door: {
    state: {
      brick_size: 15,
      center: [0, 0, 16],
      extent: [5, 15, 30],
      shift: [10, -10, 0],
      orientation: { open: 19, self: 16 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-371, 245, 150],
        size: [5, 15, 14],
        rotation: 2,
        direction: 0,
      },
      bricks: [
        {
          position: [-371, 245, 150],
          size: [5, 15, 14],
          rotation: 2,
          direction: 0,
        },
        {
          position: [-355, 255, 154],
          size: [1, 5, 2],
          rotation: 2,
          direction: 0,
        },
        {
          position: [-355, 255, 149],
          size: [4, 5, 2],
          rotation: 0,
          direction: 0,
        },
        {
          position: [-355, 240, 150],
          size: [10, 5, 2],
          rotation: 3,
          direction: 0,
        },
        {
          position: [-339, 245, 150],
          size: [5, 15, 14],
          rotation: 2,
          direction: 0,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-371, 235, 140],
        size: [5, 15, 14],
        rotation: 1,
        direction: 0,
      },
      bricks: [
        {
          position: [-371, 235, 140],
          size: [5, 15, 14],
          rotation: 1,
          direction: 0,
        },
        {
          position: [-355, 239, 130],
          size: [1, 5, 2],
          rotation: 1,
          direction: 0,
        },
        {
          position: [-355, 234, 130],
          size: [4, 5, 2],
          rotation: 3,
          direction: 0,
        },
        {
          position: [-355, 235, 145],
          size: [10, 5, 2],
          rotation: 2,
          direction: 0,
        },
        {
          position: [-339, 235, 140],
          size: [5, 15, 14],
          rotation: 1,
          direction: 0,
        },
      ],
    },
  },
  zPositive0Setup_yNegative0Door: {
    state: {
      brick_size: 15,
      center: [0, 0, -16],
      extent: [5, 15, 30],
      shift: [10, -10, 0],
      orientation: { open: 19, self: 16 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-545, 104, 185],
        size: [5, 15, 14],
        rotation: 0,
        direction: 3,
      },
      bricks: [
        {
          position: [-545, 136, 185],
          size: [5, 15, 14],
          rotation: 0,
          direction: 3,
        },
        {
          position: [-555, 120, 181],
          size: [1, 5, 2],
          rotation: 0,
          direction: 3,
        },
        {
          position: [-555, 120, 186],
          size: [4, 5, 2],
          rotation: 2,
          direction: 3,
        },
        {
          position: [-540, 120, 185],
          size: [10, 5, 2],
          rotation: 1,
          direction: 3,
        },
        {
          position: [-545, 104, 185],
          size: [5, 15, 14],
          rotation: 0,
          direction: 3,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-535, 104, 195],
        size: [5, 15, 14],
        rotation: 3,
        direction: 3,
      },
      bricks: [
        {
          position: [-535, 136, 195],
          size: [5, 15, 14],
          rotation: 3,
          direction: 3,
        },
        {
          position: [-539, 120, 205],
          size: [1, 5, 2],
          rotation: 3,
          direction: 3,
        },
        {
          position: [-534, 120, 205],
          size: [4, 5, 2],
          rotation: 1,
          direction: 3,
        },
        {
          position: [-535, 120, 190],
          size: [10, 5, 2],
          rotation: 0,
          direction: 3,
        },
        {
          position: [-535, 104, 195],
          size: [5, 15, 14],
          rotation: 3,
          direction: 3,
        },
      ],
    },
  },
  zPositive0Setup_yPositive0Door: {
    state: {
      brick_size: 15,
      center: [0, 0, -16],
      extent: [5, 15, 30],
      shift: [10, -10, 0],
      orientation: { open: 19, self: 16 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-525, 204, 185],
        size: [5, 15, 14],
        rotation: 0,
        direction: 2,
      },
      bricks: [
        {
          position: [-525, 172, 185],
          size: [5, 15, 14],
          rotation: 0,
          direction: 2,
        },
        {
          position: [-515, 188, 181],
          size: [1, 5, 2],
          rotation: 0,
          direction: 2,
        },
        {
          position: [-515, 188, 186],
          size: [4, 5, 2],
          rotation: 2,
          direction: 2,
        },
        {
          position: [-530, 188, 185],
          size: [10, 5, 2],
          rotation: 1,
          direction: 2,
        },
        {
          position: [-525, 204, 185],
          size: [5, 15, 14],
          rotation: 0,
          direction: 2,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-535, 204, 195],
        size: [5, 15, 14],
        rotation: 3,
        direction: 2,
      },
      bricks: [
        {
          position: [-535, 172, 195],
          size: [5, 15, 14],
          rotation: 3,
          direction: 2,
        },
        {
          position: [-531, 188, 205],
          size: [1, 5, 2],
          rotation: 3,
          direction: 2,
        },
        {
          position: [-536, 188, 205],
          size: [4, 5, 2],
          rotation: 1,
          direction: 2,
        },
        {
          position: [-535, 188, 190],
          size: [10, 5, 2],
          rotation: 0,
          direction: 2,
        },
        {
          position: [-535, 204, 195],
          size: [5, 15, 14],
          rotation: 3,
          direction: 2,
        },
      ],
    },
  },

  // single brick doors to test rotation and position easier
  crest_zPositive0Setup_zPositive0Door: {
    state: {
      brick_size: 10,
      center: [0, 0, 0],
      extent: [5, 10, 6],
      shift: [5, -5, 0],
      orientation: { open: 19, self: 19 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-275, -450, 6],
        size: [10, 5, 6],
        rotation: 3,
        direction: 4,
      },
      bricks: [
        {
          position: [-275, -450, 6],
          size: [10, 5, 6],
          rotation: 3,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-270, -455, 6],
        size: [10, 5, 6],
        rotation: 2,
        direction: 4,
      },
      bricks: [
        {
          position: [-270, -455, 6],
          size: [10, 5, 6],
          rotation: 2,
          direction: 4,
        },
      ],
    },
  },
  crest_zPositive0Setup_zPositive90Door: {
    state: {
      brick_size: 10,
      center: [0, 0, 0],
      extent: [5, 10, 6],
      shift: [5, -5, 0],
      orientation: { open: 19, self: 19 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-280, -525, 6],
        size: [10, 5, 6],
        rotation: 0,
        direction: 4,
      },
      bricks: [
        {
          position: [-280, -525, 6],
          size: [10, 5, 6],
          rotation: 0,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-275, -520, 6],
        size: [10, 5, 6],
        rotation: 3,
        direction: 4,
      },
      bricks: [
        {
          position: [-275, -520, 6],
          size: [10, 5, 6],
          rotation: 3,
          direction: 4,
        },
      ],
    },
  },
  crest_zPositive0Setup_yPositive0Door: {
    state: {
      brick_size: 10,
      center: [0, 0, 0],
      extent: [5, 10, 6],
      shift: [5, -5, 0],
      orientation: { open: 19, self: 19 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-480, -464, 125],
        size: [10, 5, 6],
        rotation: 3,
        direction: 2,
      },
      bricks: [
        {
          position: [-480, -464, 125],
          size: [10, 5, 6],
          rotation: 3,
          direction: 2,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-485, -464, 130],
        size: [10, 5, 6],
        rotation: 2,
        direction: 2,
      },
      bricks: [
        {
          position: [-485, -464, 130],
          size: [10, 5, 6],
          rotation: 2,
          direction: 2,
        },
      ],
    },
  },
  crest_zPositive0Setup_yPositive90Door: {
    state: {
      brick_size: 10,
      center: [0, 0, 0],
      extent: [5, 10, 6],
      shift: [5, -5, 0],
      orientation: { open: 19, self: 19 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-485, -464, 130],
        size: [10, 5, 6],
        rotation: 0,
        direction: 2,
      },
      bricks: [
        {
          position: [-485, -464, 130],
          size: [10, 5, 6],
          rotation: 0,
          direction: 2,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-480, -464, 135],
        size: [10, 5, 6],
        rotation: 3,
        direction: 2,
      },
      bricks: [
        {
          position: [-480, -464, 135],
          size: [10, 5, 6],
          rotation: 3,
          direction: 2,
        },
      ],
    },
  },
  crest_zPositive0Setup_xPositive0Door: {
    state: {
      brick_size: 10,
      center: [0, 0, 0],
      extent: [5, 10, 6],
      shift: [5, -5, 0],
      orientation: { open: 19, self: 19 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-496, -480, 125],
        size: [10, 5, 6],
        rotation: 3,
        direction: 1,
      },
      bricks: [
        {
          position: [-496, -480, 125],
          size: [10, 5, 6],
          rotation: 3,
          direction: 1,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-496, -485, 130],
        size: [10, 5, 6],
        rotation: 2,
        direction: 1,
      },
      bricks: [
        {
          position: [-496, -485, 130],
          size: [10, 5, 6],
          rotation: 2,
          direction: 1,
        },
      ],
    },
  },

  xPositive180Setup_zPositive270Door: {
    state: {
      brick_size: 15,
      center: [-16, 0, 0],
      extent: [30, 15, 5],
      shift: [0, -10, -10],
      orientation: { open: 19, self: 2 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-105, 25, 46],
        size: [5, 15, 14],
        rotation: 3,
        direction: 4,
      },
      bricks: [
        {
          position: [-105, 25, 46],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-110, 25, 30],
          size: [10, 5, 2],
          rotation: 0,
          direction: 4,
        },
        { position: [-95, 24, 30], size: [4, 5, 2], rotation: 1, direction: 4 },
        { position: [-95, 29, 30], size: [1, 5, 2], rotation: 3, direction: 4 },
        {
          position: [-105, 25, 14],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-115, 15, 46],
        size: [5, 15, 14],
        rotation: 2,
        direction: 4,
      },
      bricks: [
        {
          position: [-115, 15, 46],
          size: [5, 15, 14],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-115, 20, 30],
          size: [10, 5, 2],
          rotation: 3,
          direction: 4,
        },
        { position: [-116, 5, 30], size: [4, 5, 2], rotation: 0, direction: 4 },
        { position: [-111, 5, 30], size: [1, 5, 2], rotation: 2, direction: 4 },
        {
          position: [-115, 15, 14],
          size: [5, 15, 14],
          rotation: 2,
          direction: 4,
        },
      ],
    },
  },
  yPositive180Setup_zPositive0Door: {
    state: {
      brick_size: 15,
      center: [0, -16, 0],
      extent: [15, 30, 5],
      shift: [10, 0, -10],
      orientation: { open: 19, self: 10 },
      flags: {},
    },
    closed: {
      clickedBrick: {
        position: [-275, -535, 46],
        size: [5, 15, 14],
        rotation: 0,
        direction: 4,
      },
      bricks: [
        {
          position: [-274, -525, 30],
          size: [4, 5, 2],
          rotation: 2,
          direction: 4,
        },
        {
          position: [-275, -535, 14],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-279, -525, 30],
          size: [1, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-275, -540, 30],
          size: [10, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-275, -535, 46],
          size: [5, 15, 14],
          rotation: 0,
          direction: 4,
        },
      ],
    },
    open: {
      clickedBrick: {
        position: [-265, -545, 46],
        size: [5, 15, 14],
        rotation: 3,
        direction: 4,
      },
      bricks: [
        {
          position: [-255, -546, 30],
          size: [4, 5, 2],
          rotation: 1,
          direction: 4,
        },
        {
          position: [-265, -545, 14],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-255, -541, 30],
          size: [1, 5, 2],
          rotation: 3,
          direction: 4,
        },
        {
          position: [-270, -545, 30],
          size: [10, 5, 2],
          rotation: 0,
          direction: 4,
        },
        {
          position: [-265, -545, 46],
          size: [5, 15, 14],
          rotation: 3,
          direction: 4,
        },
      ],
    },
  },
};
