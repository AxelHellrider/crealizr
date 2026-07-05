// utils/encounter.ts

import type { Monster, Terrain, Affiliation } from "@/app/types/monster";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";

export type { Terrain, Affiliation };
export { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG };

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

export type EncounterSuggestion = {
    cr: number;
    count: number;
    xpEach: number;
    adjustedXP: number;
    fit: number;
};

export type MonsterRecommendationMember = {
    name: string;
    count: number;
    cr: number;
    xpEach: number;
    benchmarkCr: number;
    crDelta: number;
    matchQuality: "exact" | "nearest";
};

export type MonsterRecommendation = {
    formation: "solo" | "group";
    members: MonsterRecommendationMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};


export function getMonstersForCR(cr: number, ruleset: Ruleset = "2014", customCatalog?: readonly Monster[]): Monster[] {
    const catalog = customCatalog ?? (ruleset === "2024" ? MONSTER_MANUAL_2024_CATALOG : MONSTER_MANUAL_2014_CATALOG);
    return catalog.filter((monster) => monster.cr === cr);
}

function pickMonsterManualBenchmark(cr: number, seed: number, ruleset: Ruleset = "2014", customCatalog?: readonly Monster[]) {
    const catalog = customCatalog ?? (ruleset === "2024" ? MONSTER_MANUAL_2024_CATALOG : MONSTER_MANUAL_2014_CATALOG);
    const exactMatches = catalog.filter((monster) => monster.cr === cr);
    if (exactMatches.length > 0) {
        return exactMatches[Math.abs(seed) % exactMatches.length];
    }

    return catalog.reduce((best, monster) => {
        const bestDelta = Math.abs(best.cr - cr);
        const currentDelta = Math.abs(monster.cr - cr);
        return currentDelta < bestDelta ? monster : best;
    });
}

export function suggestEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
}): EncounterSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const crs = Object.keys(rulesetXP).map(Number);
    const results: EncounterSuggestion[] = [];

    for (const cr of crs) {
        const xpEach = rulesetXP[String(cr)];
        for (let n = 1; n <= 8; n++) {
            const adj = Math.round(xpEach * n * encounterMultiplier(n));
            const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);
            if (fit >= 0.7) {
                results.push({ cr, count: n, xpEach, adjustedXP: adj, fit });
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.adjustedXP - b.adjustedXP))
        .slice(0, 12);
}

export function recommendMonstersForParty(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    formation?: "solo" | "group";
    maxTypes?: number;
    includeMinions?: boolean;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    limit?: number;
    catalog?: readonly Monster[];
}): MonsterRecommendation[] {
    const seed = opts.level * 31 + opts.size * 7;
    const seen = new Set<string>();
    const limit = Math.min(8, Math.max(1, opts.limit ?? 6));
    const formation = opts.formation ?? "solo";

    const toMember = (member: GroupMember, seedOffset: number): MonsterRecommendationMember => {
        const monster = pickMonsterManualBenchmark(member.cr, seed + seedOffset, opts.ruleset, opts.catalog);
        return {
            name: monster.name,
            count: member.count,
            cr: member.cr,
            xpEach: member.xpEach,
            benchmarkCr: monster.cr,
            crDelta: Math.abs(monster.cr - member.cr),
            matchQuality: monster.cr === member.cr ? "exact" : "nearest",
        };
    };

    if (formation === "group") {
        return suggestGroupEncounters({
            ...opts,
            maxTypes: opts.maxTypes,
            relationCriteria: opts.relationCriteria,
            catalog: opts.catalog,
        }).reduce<MonsterRecommendation[]>((recommendations, suggestion, index) => {
            if (recommendations.length >= limit) return recommendations;

            const members = suggestion.members.map((member, memberIndex) =>
                toMember(member, index * 11 + memberIndex)
            );
            const key = members.map((member) => `${member.count}x${member.name}`).join("|");
            if (seen.has(key)) return recommendations;

            seen.add(key);
            recommendations.push({
                formation: "group",
                members,
                totalCount: suggestion.totalCount,
                adjustedXP: suggestion.adjustedXP,
                fit: suggestion.fit,
            });

            return recommendations;
        }, []);
    }

    return suggestBossWithMinions({
        ...opts,
        includeMinions: opts.includeMinions ?? false,
        relationCriteria: opts.relationCriteria,
        catalog: opts.catalog,
    }).reduce<MonsterRecommendation[]>((recommendations, suggestion, index) => {
        if (recommendations.length >= limit) return recommendations;

        const bossGroupMember: GroupMember = { cr: suggestion.boss.cr, count: suggestion.boss.count, xpEach: suggestion.boss.xpEach };
        const bossMember = toMember(bossGroupMember, index * 11);

        const minionMembers = suggestion.minions.map((minion, minionIndex) =>
            toMember(minion, index * 11 + minionIndex + 1)
        );

        const members = [bossMember, ...minionMembers];
        const key = members.map((m) => `${m.count}x${m.name}`).join("|");
        if (seen.has(key)) return recommendations;

        seen.add(key);
        recommendations.push({
            formation: "solo",
            members,
            totalCount: suggestion.totalCount,
            adjustedXP: suggestion.adjustedXP,
            fit: suggestion.fit,
        });

        return recommendations;
    }, []);
}

export type GroupMember = { cr: number; count: number; xpEach: number };
export type GroupSuggestion = {
    members: GroupMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export type BossMinionSuggestion = {
    boss: GroupMember;
    minions: GroupMember[];
    totalCount: number;
    adjustedXP: number;
    fit: number;
};

export function getRelatedMonsters(
    baseMonster: Monster,
    criteria: "terrain" | "affiliation" | "genus" | "any",
    ruleset: Ruleset = "2014",
    customCatalog?: readonly Monster[]
): Monster[] {
    const catalog = customCatalog ?? (ruleset === "2024" ? MONSTER_MANUAL_2024_CATALOG : MONSTER_MANUAL_2014_CATALOG);
    if (criteria === "any") {
        return [...catalog];
    }

    return catalog.filter((monster) => {
        if (criteria === "terrain") {
            return monster.terrain.some((t) => baseMonster.terrain.includes(t)) ||
                baseMonster.terrain.some((t) => monster.terrain.includes(t)) ||
                monster.terrain.includes("any") || baseMonster.terrain.includes("any");
        }
        if (criteria === "affiliation") {
            return monster.affiliation === baseMonster.affiliation ||
                monster.affiliation === "any" || baseMonster.affiliation === "any";
        }
        if (criteria === "genus") {
            return monster.genus === baseMonster.genus;
        }
        return false;
    });
}

export function suggestBossWithMinions(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    includeMinions: boolean;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    catalog?: readonly Monster[];
}): BossMinionSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const results: BossMinionSuggestion[] = [];

    // Find suitable boss CR (should be higher than party level, typically 2-4 levels higher)
    const bossCRs = Object.keys(rulesetXP)
        .map(Number)
        .filter((cr) => cr >= opts.level && cr <= opts.level + 4);

    for (const bossCR of bossCRs) {
        const bossXP = rulesetXP[String(bossCR)];
        const bossCount = 1;
        const bossAdjustedXP = Math.round(bossXP * encounterMultiplier(bossCount));

        if (!opts.includeMinions) {
            // Boss only
            const fit = Math.min(opts.budget, bossAdjustedXP) / Math.max(opts.budget, bossAdjustedXP);
            if (fit >= 0.7) {
                results.push({
                    boss: { cr: bossCR, count: bossCount, xpEach: bossXP },
                    minions: [],
                    totalCount: bossCount,
                    adjustedXP: bossAdjustedXP,
                    fit,
                });
            }
            continue;
        }

        // Boss + minions
        const remainingBudget = opts.budget - bossAdjustedXP * 0.6; // Boss takes 60% of budget
        if (remainingBudget <= 0) continue;

        const bossMonster = pickMonsterManualBenchmark(bossCR, opts.level * 31, opts.ruleset, opts.catalog);
        const relatedMonsters = getRelatedMonsters(bossMonster, opts.relationCriteria || "any", opts.ruleset, opts.catalog);

        // Find suitable minions (lower CR than boss)
        const minionCRs = relatedMonsters
            .map((m) => m.cr)
            .filter((cr) => cr < bossCR && cr >= 0)
            .filter((value, index, self) => self.indexOf(value) === index) // unique
            .sort((a, b) => a - b);

        for (const minionCR of minionCRs) {
            const minionXP = rulesetXP[String(minionCR)];
            for (let minionCount = 2; minionCount <= 8; minionCount++) {
                const minionTotalXP = minionXP * minionCount;
                const minionAdjustedXP = Math.round(minionTotalXP * encounterMultiplier(minionCount + 1));
                const totalAdjustedXP = bossAdjustedXP + minionAdjustedXP;
                const fit = Math.min(opts.budget, totalAdjustedXP) / Math.max(opts.budget, totalAdjustedXP);

                if (fit >= 0.7 && totalAdjustedXP <= opts.budget * 1.3) {
                    results.push({
                        boss: { cr: bossCR, count: bossCount, xpEach: bossXP },
                        minions: [{ cr: minionCR, count: minionCount, xpEach: minionXP }],
                        totalCount: bossCount + minionCount,
                        adjustedXP: totalAdjustedXP,
                        fit,
                    });
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (b.totalCount - a.totalCount))
        .slice(0, 12);
}

// ── Shared combinatorics helpers ────────────────────────────────────────────
function buildCompositions(total: number, parts: number, min = 1): number[][] {
    if (parts === 1) return total >= min ? [[total]] : [];
    const combos: number[][] = [];
    for (let i = min; i <= total - (parts - 1) * min; i++) {
        buildCompositions(total - i, parts - 1, min).forEach(tail => combos.push([i, ...tail]));
    }
    return combos;
}

function buildCombinations<T>(arr: T[], size: number, start = 0, path: T[] = [], out: T[][] = []): T[][] {
    if (path.length === size) { out.push([...path]); return out; }
    for (let i = start; i <= arr.length - (size - path.length); i++) {
        path.push(arr[i]);
        buildCombinations(arr, size, i + 1, path, out);
        path.pop();
    }
    return out;
}

// ── CR-based encounter math ──────────────────────────────────────────────────
const CR_DIFFICULTY_OFFSET: Record<Difficulty, number> = {
    easy: -2, medium: 0, hard: 1, deadly: 3,
};

/** Target CR for a single-monster encounter at the given level and difficulty. */
export function crTarget(level: number, difficulty: Difficulty): number {
    return Math.max(0.125, level + CR_DIFFICULTY_OFFSET[difficulty]);
}

/**
 * Threat weight of an encounter expressed in CR units.
 * Mirrors the XP adjusted-XP formula but in CR space (no XP lookup needed).
 */
export function crEncounterWeight(members: { cr: number; count: number }[]): number {
    const totalCount = members.reduce((s, m) => s + m.count, 0);
    const totalCR    = members.reduce((s, m) => s + m.cr * m.count, 0);
    return totalCR * Math.sqrt(encounterMultiplier(totalCount));
}

/**
 * CR-mode "budget": the CR threat level this party can handle for the given
 * difficulty, scaled by party size relative to the canonical 4-player baseline.
 */
export function crBudgetForParty(level: number, size: number, difficulty: Difficulty): number {
    return crTarget(level, difficulty) * (size / 4);
}

export function suggestBossWithMinionsCR(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    includeMinions: boolean;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    catalog?: readonly Monster[];
}): BossMinionSuggestion[] {
    const target = crTarget(opts.level, opts.difficulty);
    const budget = crBudgetForParty(opts.level, opts.size, opts.difficulty);
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const allCRs = Object.keys(rulesetXP).map(Number).sort((a, b) => a - b);

    // Boss CRs: slightly above target up to +4, and slightly below (min 0.125)
    const bossCRs = allCRs.filter(cr => cr >= Math.max(0.125, target - 1) && cr <= target + 4);
    const results: BossMinionSuggestion[] = [];

    for (const bossCR of bossCRs) {
        const xpEach = rulesetXP[String(bossCR)];

        if (!opts.includeMinions) {
            const weight = crEncounterWeight([{ cr: bossCR, count: 1 }]);
            const fit = Math.min(budget, weight) / Math.max(budget, weight);
            if (fit >= 0.5) {
                results.push({ boss: { cr: bossCR, count: 1, xpEach }, minions: [], totalCount: 1, adjustedXP: Math.round(weight * 100) / 100, fit });
            }
            continue;
        }

        const bossMonster = pickMonsterManualBenchmark(bossCR, opts.level * 31, opts.ruleset, opts.catalog);
        const related = getRelatedMonsters(bossMonster, opts.relationCriteria ?? "any", opts.ruleset, opts.catalog);
        const minionCRs = [...new Set(related.map(m => m.cr))]
            .filter(cr => cr < bossCR && cr >= 0.125 && rulesetXP[String(cr)] !== undefined)
            .sort((a, b) => a - b);

        for (const minionCR of minionCRs) {
            const minionXP = rulesetXP[String(minionCR)];
            for (let n = 1; n <= opts.size + 2; n++) {
                const members = [{ cr: bossCR, count: 1 }, { cr: minionCR, count: n }];
                const weight = crEncounterWeight(members);
                const fit = Math.min(budget, weight) / Math.max(budget, weight);
                if (fit >= 0.5) {
                    results.push({ boss: { cr: bossCR, count: 1, xpEach }, minions: [{ cr: minionCR, count: n, xpEach: minionXP }], totalCount: 1 + n, adjustedXP: Math.round(weight * 100) / 100, fit });
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.totalCount - b.totalCount))
        .slice(0, 12);
}

export function suggestGroupEncountersCR(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    maxTypes?: number;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    catalog?: readonly Monster[];
}): GroupSuggestion[] {
    const target = crTarget(opts.level, opts.difficulty);
    const budget = crBudgetForParty(opts.level, opts.size, opts.difficulty);
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];

    // Candidates: CRs within a ×4 range of the target
    let candidates = Object.entries(rulesetXP)
        .map(([cr, xp]) => ({ cr: Number(cr), xp }))
        .filter(({ cr }) => cr >= Math.max(0.125, target * 0.25) && cr <= target * 4);

    if (candidates.length === 0) return [];

    const relationCriteria = opts.relationCriteria ?? "any";
    if (relationCriteria !== "any") {
        const baseMonster = pickMonsterManualBenchmark(candidates[0].cr, opts.level * 31, opts.ruleset, opts.catalog);
        const related = getRelatedMonsters(baseMonster, relationCriteria, opts.ruleset, opts.catalog);
        const relatedCRs = new Set(related.map(m => m.cr));
        candidates = candidates.filter(c => relatedCRs.has(c.cr));
        if (candidates.length === 0) return [];
    }

    const results: GroupSuggestion[] = [];
    const seen = new Set<string>();
    const maxTypes = Math.min(5, Math.max(2, opts.maxTypes ?? 2));

    for (let n = 2; n <= 8; n++) {
        for (let typeCount = 2; typeCount <= Math.min(maxTypes, n, candidates.length); typeCount++) {
            const crCombos = buildCombinations(candidates, typeCount);
            const compositions = buildCompositions(n, typeCount);
            for (const combo of crCombos) {
                for (const counts of compositions) {
                    const members = combo.map((entry, idx) => ({ cr: entry.cr, count: counts[idx], xpEach: entry.xp }));
                    const weight = crEncounterWeight(members);
                    const fit = Math.min(budget, weight) / Math.max(budget, weight);
                    if (fit >= 0.5) {
                        const key = members.map(m => `${m.cr}x${m.count}`).join("|");
                        if (seen.has(key)) continue;
                        seen.add(key);
                        results.push({ members, totalCount: n, adjustedXP: Math.round(weight * 100) / 100, fit });
                    }
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.adjustedXP - b.adjustedXP))
        .slice(0, 12);
}

export function suggestGroupEncounters(opts: {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budget: number;
    maxTypes?: number;
    relationCriteria?: "terrain" | "affiliation" | "genus" | "any";
    catalog?: readonly Monster[];
}): GroupSuggestion[] {
    const rulesetXP = XP_PER_CR[opts.ruleset] || XP_PER_CR["2014"];
    const crs = Object.entries(rulesetXP)
        .map(([cr, xp]) => ({ cr: Number(cr), xp }));

    const results: GroupSuggestion[] = [];
    const seen = new Set<string>();
    const maxTypes = Math.min(5, Math.max(2, opts.maxTypes ?? 2));
    const relationCriteria = opts.relationCriteria || "any";

    for (let n = 2; n <= 8; n++) {
        const multiplier = encounterMultiplier(n);
        const targetPer = opts.budget / (multiplier * n);
        let candidates = [...crs]
            .sort((a, b) => Math.abs(a.xp - targetPer) - Math.abs(b.xp - targetPer))
            .slice(0, 12);

        // Filter candidates by relation criteria if not "any"
        if (relationCriteria !== "any") {
            const baseMonster = pickMonsterManualBenchmark(candidates[0].cr, opts.level * 31, opts.ruleset, opts.catalog);
            const relatedMonsters = getRelatedMonsters(baseMonster, relationCriteria, opts.ruleset, opts.catalog);
            const relatedCRs = new Set(relatedMonsters.map((m) => m.cr));
            candidates = candidates.filter((c) => relatedCRs.has(c.cr));
        }

        for (let typeCount = 2; typeCount <= Math.min(maxTypes, n, candidates.length); typeCount += 1) {
            const crCombos = buildCombinations(candidates, typeCount);
            const compositions = buildCompositions(n, typeCount);

            for (const combo of crCombos) {
                for (const counts of compositions) {
                    const members = combo.map((entry, idx) => ({
                        cr: entry.cr,
                        count: counts[idx],
                        xpEach: entry.xp,
                    }));

                    const key = members.map((m) => `${m.cr}x${m.count}`).join("|");
                    if (seen.has(key)) continue;

                    const totalXP = members.reduce((s, m) => s + m.count * m.xpEach, 0);
                    const adj = Math.round(totalXP * multiplier);
                    const fit = Math.min(opts.budget, adj) / Math.max(opts.budget, adj);

                    if (fit >= 0.7) {
                        seen.add(key);
                        results.push({ members, totalCount: n, adjustedXP: adj, fit });
                    }
                }
            }
        }
    }

    return results
        .sort((a, b) => (b.fit - a.fit) || (a.adjustedXP - b.adjustedXP))
        .slice(0, 12);
}