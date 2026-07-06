// engine/encounter/xpTables.ts
// XP-based encounter math (5e 2014/2024 DMG tables) — the "classic" budgeting mode.

export type Difficulty = "easy" | "medium" | "hard" | "deadly";
export type Ruleset = "2014" | "2024";
export type BudgetMode = "encounter" | "daily";

export const XP_THRESHOLDS = {
    "2014": {
        1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
        2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
        3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
        4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
        5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
        6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
        7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
        8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
        9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
        10:{ easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
        11:{ easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
        12:{ easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
        13:{ easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
        14:{ easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
        15:{ easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
        16:{ easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
        17:{ easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
        18:{ easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
        19:{ easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
        20:{ easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
    },
    "2024": {
        1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
        2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
        3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
        4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
        5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
        6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
        7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
        8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
        9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
        10:{ easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
        11:{ easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
        12:{ easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
        13:{ easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
        14:{ easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
        15:{ easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
        16:{ easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
        17:{ easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
        18:{ easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
        19:{ easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
        20:{ easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
    },
};

export const XP_PER_CR: Record<Ruleset, Record<string, number>> = {
    "2014": {
        "0": 10, "0.125": 25, "0.25": 50, "0.5": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000,
        "16": 15000, "17": 18000, "18": 20000,
        "19": 22000, "20": 25000, "21": 33000,
        "22": 41000, "23": 50000, "24": 62000,
        "25": 75000, "26": 90000, "27": 105000,
        "28": 120000, "29": 135000, "30": 155000,
    },
    "2024": {
        "0": 10, "0.125": 25, "0.25": 50, "0.5": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000,
        "16": 15000, "17": 18000, "18": 20000,
        "19": 22000, "20": 25000, "21": 33000,
        "22": 41000, "23": 50000, "24": 62000,
        "25": 75000, "26": 90000, "27": 105000,
        "28": 120000, "29": 135000, "30": 155000,
    },
};

export function encounterMultiplier(count: number) {
    if (count <= 1) return 1;
    if (count === 2) return 1.5;
    if (count <= 6) return 2;
    if (count <= 10) return 2.5;
    if (count <= 14) return 3;
    return 4;
}

export function partyBudget(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    mode: BudgetMode;
}) {
    const rulesetKey = opts.ruleset === "2024" ? "2024" : "2014";
    const rulesetData = XP_THRESHOLDS[rulesetKey];
    const lvl = Math.min(20, Math.max(1, opts.level)) as keyof typeof rulesetData;
    const levels = rulesetData[lvl] || XP_THRESHOLDS["2014"][1];
    const base = levels[opts.difficulty] || 0;
    const encounter = base * opts.size;
    return opts.mode === "daily" ? Math.round(encounter * 3.4) : encounter;
}
