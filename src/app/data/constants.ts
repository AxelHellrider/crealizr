function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export const CR_VALUES = [
    0,
    0.125,
    0.25,
    0.5,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];

export const ABILITY_SCORE_MODIFIERS = {
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
};

export const CR_MATRIX = [
    {
        cr: 0,
        pb: "+2",
        ac: randInt(10, 13),
        hp: randInt(1, 6),
        atkb: randInt(1, 3),
        dpr: randInt(0, 1),
        save_dc: randInt(10, 13)
    },
    {
        cr: 0.125,
        pb: "+2",
        ac: 13,
        hp: randInt(7, 35),
        atkb: "+3",
        dpr: randInt(2, 3),
        save_dc: 13
    },
    {
        cr: 0.25,
        pb: "+2",
        ac: 13,
        hp: randInt(36, 49),
        atkb: "+3",
        dpr: randInt(4, 5),
        save_dc: 13
    },
    {
        cr: 0.5,
        pb: "+2",
        ac: 13,
        hp: randInt(50, 70),
        atkb: "+3",
        dpr: randInt(6, 8),
        save_dc: 13
    },
    {
        cr: 1,
        pb: "+2",
        ac: 13,
        hp: randInt(71, 85),
        atkb: "+3",
        dpr: randInt(9, 14),
        save_dc: 13
    },
    {
        cr: 2,
        pb: "+2",
        ac: 13,
        hp: randInt(86, 100),
        atkb: "+3",
        dpr: randInt(15, 20),
        save_dc: 13
    },
    {
        cr: 3,
        pb: "+2",
        ac: 13,
        hp: randInt(101, 115),
        atkb: "+4",
        dpr: randInt(21, 26),
        save_dc: 13
    },
    {
        cr: 4,
        pb: "+2",
        ac: 14,
        hp: randInt(116, 130),
        atkb: "+5",
        dpr: randInt(27, 32),
        save_dc: 14
    },
]
