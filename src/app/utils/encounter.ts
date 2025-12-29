// utils/encounter.ts

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
    },
    "2024": {} as any, // identical for now
};

export const XP_PER_CR: Record<Ruleset, Record<string, number>> = {
    "2014": {
        "0": 10, "0.125": 25, "0.25": 50, "0.5": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000,
        "16": 15000, "17": 18000, "18": 20000,
        "19": 22000, "20": 25000,
    },
    "2024": {} as any,
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
    const lvl = Math.min(20, Math.max(1, opts.level));
    const base = XP_THRESHOLDS[opts.ruleset][lvl][opts.difficulty];
    const encounter = base * opts.size;
    return opts.mode === "daily" ? Math.round(encounter * 3.4) : encounter;
}

export type EncounterSuggestion = {
    cr: number;
    count: number;
    xpEach: number;
    adjustedXP: number;
    fit: number;
};

export function suggestEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
}): EncounterSuggestion[] {
    const crs = Object.keys(XP_PER_CR[opts.ruleset]).map(Number);
    const results: EncounterSuggestion[] = [];

    for (const cr of crs) {
        const xpEach = XP_PER_CR[opts.ruleset][String(cr)];
        for (let n = 1; n <= 8; n++) {
            const adj = Math.round(xpEach * n * encounterMultiplier(n));
            const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);
            if (fit >= 0.7) {
                results.push({ cr, count: n, xpEach, adjustedXP: adj, fit });
            }
        }
    }

    return results.sort((a, b) => b.fit - a.fit).slice(0, 12);
}

export type GroupMember = { cr: number; count: number; xpEach: number };
export type GroupSuggestion = {
    members: GroupMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export function suggestGroupEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
}): GroupSuggestion[] {
    const crs = Object.entries(XP_PER_CR[opts.ruleset])
        .map(([cr, xp]) => ({ cr: Number(cr), xp }));

    const results: GroupSuggestion[] = [];
    const seen = new Set<string>();

    for (let n = 2; n <= 8; n++) {
        const per = opts.budget / (encounterMultiplier(n) * n);

        for (const a of crs) {
            for (const b of crs) {
                const members = [
                    { cr: a.cr, count: Math.floor(n / 2), xpEach: a.xp },
                    { cr: b.cr, count: n - Math.floor(n / 2), xpEach: b.xp },
                ];

                const key = members.map(m => `${m.cr}x${m.count}`).join("|");
                if (seen.has(key)) continue;

                const totalXP = members.reduce((s, m) => s + m.count * m.xpEach, 0);
                const adj = Math.round(totalXP * encounterMultiplier(n));
                const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);

                if (fit >= 0.7) {
                    seen.add(key);
                    results.push({ members, totalCount: n, adjustedXP: adj, fit });
                }
            }
        }
    }

    return results.sort((a, b) => b.fit - a.fit).slice(0, 12);
}
