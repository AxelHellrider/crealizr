// 2024 ruleset constants. For initial support we align ranges closely to 2014
// so the toolkit functions equivalently while keeping data isolated for future tweaks.

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const CR_VALUES_2024 = [
  0,
  0.125,
  0.25,
  0.5,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];

export const ABILITY_SCORE_MODIFIERS_2024 = {
  "-5": [1],
  "-4": [2, 3],
  "-3": [4, 5],
  "-2": [6, 7],
  "-1": [8, 9],
  "0": [10, 11],
  "+1": [12, 13],
  "+2": [14, 15],
  "+3": [16, 17],
  "+4": [18, 19],
  "+5": [20, 21],
  "+6": [22, 23],
  "+7": [24, 25],
  "+8": [26, 27],
  "+9": [28, 29],
  "+10": [30],
} as const;

// Lightweight CR matrix for 2024. Values are randomized within bands
// similar to 2014 to avoid a single deterministic outcome.
export const CR_MATRIX_2024 = [
  { cr: 0, pb: "+2", ac: randInt(13, 13), hp: randInt(1, 6), atkb: "+3", dpr: randInt(0, 1), save_dc: 13 },
  { cr: 0.125, pb: "+2", ac: 13, hp: randInt(7, 35), atkb: "+3", dpr: randInt(2, 3), save_dc: 13 },
  { cr: 0.25, pb: "+2", ac: 13, hp: randInt(36, 49), atkb: "+3", dpr: randInt(4, 5), save_dc: 13 },
  { cr: 0.5, pb: "+2", ac: 13, hp: randInt(50, 70), atkb: "+3", dpr: randInt(6, 8), save_dc: 13 },
  { cr: 1, pb: "+2", ac: 13, hp: randInt(71, 85), atkb: "+3", dpr: randInt(9, 14), save_dc: 13 },
  { cr: 2, pb: "+2", ac: 13, hp: randInt(86, 100), atkb: "+3", dpr: randInt(15, 20), save_dc: 13 },
  { cr: 3, pb: "+2", ac: 13, hp: randInt(101, 115), atkb: "+4", dpr: randInt(21, 26), save_dc: 13 },
  { cr: 4, pb: "+2", ac: 14, hp: randInt(116, 130), atkb: "+5", dpr: randInt(27, 32), save_dc: 14 },
  { cr: 5, pb: "+3", ac: 15, hp: randInt(131, 145), atkb: "+6", dpr: randInt(33, 38), save_dc: 15 },
  { cr: 6, pb: "+3", ac: 15, hp: randInt(146, 160), atkb: "+6", dpr: randInt(39, 44), save_dc: 15 },
  { cr: 7, pb: "+3", ac: 15, hp: randInt(161, 175), atkb: "+6", dpr: randInt(45, 50), save_dc: 15 },
  { cr: 8, pb: "+3", ac: 16, hp: randInt(176, 190), atkb: "+7", dpr: randInt(51, 56), save_dc: 16 },
  { cr: 9, pb: "+4", ac: 16, hp: randInt(191, 205), atkb: "+7", dpr: randInt(57, 62), save_dc: 16 },
  { cr: 10, pb: "+4", ac: 17, hp: randInt(206, 220), atkb: "+7", dpr: randInt(63, 68), save_dc: 16 },
  { cr: 11, pb: "+4", ac: 17, hp: randInt(221, 235), atkb: "+8", dpr: randInt(69, 74), save_dc: 16 },
  { cr: 12, pb: "+4", ac: 17, hp: randInt(236, 250), atkb: "+8", dpr: randInt(75, 80), save_dc: 17 },
  { cr: 13, pb: "+5", ac: 18, hp: randInt(251, 265), atkb: "+8", dpr: randInt(81, 86), save_dc: 17 },
  { cr: 14, pb: "+5", ac: 18, hp: randInt(266, 280), atkb: "+8", dpr: randInt(87, 92), save_dc: 17 },
  { cr: 15, pb: "+5", ac: 18, hp: randInt(281, 295), atkb: "+8", dpr: randInt(93, 98), save_dc: 17 },
  { cr: 16, pb: "+5", ac: 18, hp: randInt(296, 310), atkb: "+9", dpr: randInt(99, 104), save_dc: 18 },
  { cr: 17, pb: "+6", ac: 18, hp: randInt(311, 325), atkb: "+9", dpr: randInt(105, 110), save_dc: 18 },
  { cr: 18, pb: "+6", ac: 18, hp: randInt(326, 340), atkb: "+9", dpr: randInt(111, 116), save_dc: 18 },
  { cr: 19, pb: "+6", ac: 19, hp: randInt(341, 355), atkb: "+10", dpr: randInt(117, 122), save_dc: 19 },
  { cr: 20, pb: "+6", ac: 19, hp: randInt(356, 400), atkb: "+10", dpr: randInt(123, 130), save_dc: 19 },
  { cr: 21, pb: "+7", ac: 19, hp: randInt(401, 445), atkb: "+10", dpr: randInt(131, 140), save_dc: 20 },
  { cr: 22, pb: "+7", ac: 19, hp: randInt(446, 490), atkb: "+11", dpr: randInt(141, 150), save_dc: 20 },
  { cr: 23, pb: "+7", ac: 19, hp: randInt(491, 535), atkb: "+11", dpr: randInt(151, 160), save_dc: 20 },
  { cr: 24, pb: "+7", ac: 19, hp: randInt(536, 580), atkb: "+12", dpr: randInt(161, 170), save_dc: 21 },
  { cr: 25, pb: "+8", ac: 19, hp: randInt(581, 625), atkb: "+12", dpr: randInt(171, 180), save_dc: 21 },
  { cr: 26, pb: "+8", ac: 19, hp: randInt(626, 670), atkb: "+12", dpr: randInt(181, 190), save_dc: 21 },
  { cr: 27, pb: "+8", ac: 19, hp: randInt(671, 715), atkb: "+13", dpr: randInt(191, 200), save_dc: 22 },
  { cr: 28, pb: "+8", ac: 19, hp: randInt(716, 760), atkb: "+13", dpr: randInt(201, 210), save_dc: 22 },
  { cr: 29, pb: "+9", ac: 19, hp: randInt(761, 805), atkb: "+13", dpr: randInt(211, 220), save_dc: 23 },
  { cr: 30, pb: "+9", ac: 19, hp: randInt(806, 850), atkb: "+14", dpr: randInt(221, 230), save_dc: 23 },
];
