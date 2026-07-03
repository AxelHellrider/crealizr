import {
    partyBudget,
    suggestBossWithMinions,
    suggestGroupEncounters,
    type Difficulty,
    type Ruleset,
    type BudgetMode,
    type GroupSuggestion,
    type BossMinionSuggestion,
} from "@/app/utils/encounter";
import type { Monster } from "@/app/types/monster";

export type { Difficulty, Ruleset, BudgetMode, GroupSuggestion, BossMinionSuggestion };

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
