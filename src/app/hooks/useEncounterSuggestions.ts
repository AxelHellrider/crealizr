import { useMemo } from "react";
import {
    partyBudget,
    suggestEncounters,
    suggestGroupEncounters,
    type Difficulty,
    type Ruleset,
    type EncounterSuggestion,
    type GroupSuggestion,
} from "@/app/utils/encounter";

type Options = {
    level: number;
    size: number;
    difficulty: Difficulty;
    ruleset: Ruleset;
};

export function useEncounterSuggestions(opts: Options) {
    const budget = useMemo(
        () => partyBudget({ ...opts, mode: "encounter" }),
        [opts.level, opts.size, opts.difficulty, opts.ruleset]
    );

    const soloSuggestions: EncounterSuggestion[] = useMemo(
        () => suggestEncounters({ ...opts, budget }),
        [opts.level, opts.size, opts.difficulty, opts.ruleset, budget]
    );

    const groupSuggestions: GroupSuggestion[] = useMemo(
        () => suggestGroupEncounters({ ...opts, budget }),
        [opts.level, opts.size, opts.difficulty, opts.ruleset, budget]
    );

    return { budget, soloSuggestions, groupSuggestions };
}
