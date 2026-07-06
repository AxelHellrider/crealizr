// engine/encounter/crMath.ts
// CR-based encounter math — the newer "CR mode" budgeting alternative to XP tables.
// Expresses encounter threat directly in Challenge Rating units instead of XP.

import type { Difficulty } from "./xpTables";
import { encounterMultiplier } from "./xpTables";

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
