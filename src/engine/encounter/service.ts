// engine/encounter/service.ts
// Public orchestration facade: picks XP-mode vs CR-mode math and returns a
// single normalized result shape, so callers don't need to know which mode
// is active.

import {
    partyBudget,
    type Difficulty,
    type Ruleset,
    type BudgetMode,
} from "./xpTables";
import { crTarget, crBudgetForParty } from "./crMath";
import {
    suggestBossWithMinions,
    suggestBossWithMinionsCR,
    suggestGroupEncounters,
    suggestGroupEncountersCR,
    type GroupSuggestion,
    type BossMinionSuggestion,
} from "./suggestions";
import type { Monster } from "@/app/types/monster";

export type { Difficulty, Ruleset, BudgetMode, GroupSuggestion, BossMinionSuggestion };
export { crTarget };

export type RelationCriteria = "terrain" | "affiliation" | "genus" | "any";
export type EncounterMode = "solo" | "group";

export type EncounterServiceOpts = {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
    budgetMode: BudgetMode;
    mode: EncounterMode;
    includeMinions: boolean;
    groupTypes: number;
    relationCriteria: RelationCriteria;
    useXP: boolean;
};

export type EncounterServiceResult = {
    budget: number;
    soloSuggestions: BossMinionSuggestion[];
    groupSuggestions: GroupSuggestion[];
};

export function buildEncounterSuggestions(
    opts: EncounterServiceOpts,
    catalog: readonly Monster[],
): EncounterServiceResult {
    if (!opts.useXP) {
        const budget = crBudgetForParty(opts.level, opts.size, opts.difficulty);
        const soloSuggestions = suggestBossWithMinionsCR({
            level: opts.level,
            size: opts.size,
            difficulty: opts.difficulty,
            ruleset: opts.ruleset,
            includeMinions: opts.includeMinions,
            relationCriteria: opts.relationCriteria,
            catalog,
        });
        const groupSuggestions = suggestGroupEncountersCR({
            level: opts.level,
            size: opts.size,
            difficulty: opts.difficulty,
            ruleset: opts.ruleset,
            maxTypes: opts.groupTypes,
            relationCriteria: opts.relationCriteria,
            catalog,
        });
        return { budget, soloSuggestions, groupSuggestions };
    }

    const budget = partyBudget({
        level: opts.level,
        size: opts.size,
        difficulty: opts.difficulty,
        ruleset: opts.ruleset,
        mode: opts.budgetMode,
    });

    const soloSuggestions = suggestBossWithMinions({
        level: opts.level,
        size: opts.size,
        difficulty: opts.difficulty,
        ruleset: opts.ruleset,
        budget,
        includeMinions: opts.includeMinions,
        relationCriteria: opts.relationCriteria,
        catalog,
    });

    const groupSuggestions = suggestGroupEncounters({
        level: opts.level,
        size: opts.size,
        difficulty: opts.difficulty,
        ruleset: opts.ruleset,
        budget,
        maxTypes: opts.groupTypes,
        relationCriteria: opts.relationCriteria,
        catalog,
    });

    return { budget, soloSuggestions, groupSuggestions };
}
