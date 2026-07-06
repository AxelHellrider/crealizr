// engine/encounter/suggestions.ts
// Encounter-composition search: given a party and a target difficulty,
// find monster combinations (solo boss+minions, or mixed groups) that fit
// the budget — in both XP mode and CR mode.

import type { Monster } from "@/app/types/monster";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";
import type { Difficulty, Ruleset } from "./xpTables";
import { XP_PER_CR, encounterMultiplier } from "./xpTables";
import { crTarget, crBudgetForParty, crEncounterWeight } from "./crMath";

export type { Terrain, Affiliation } from "@/app/types/monster";
export { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG };

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

// ── Catalog queries ──────────────────────────────────────────────────────────

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

// ── XP-mode suggestions ──────────────────────────────────────────────────────

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

// ── CR-mode suggestions ──────────────────────────────────────────────────────

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
