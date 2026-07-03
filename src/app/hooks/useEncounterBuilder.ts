"use client";

import { useReducer, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import {
    buildEncounterSuggestions,
    type EncounterServiceOpts,
    type RelationCriteria,
    type EncounterMode,
    type Difficulty,
    type Ruleset,
    type BudgetMode,
    type BossMinionSuggestion,
    type GroupSuggestion,
} from "@/app/services/encounterService";
import type { Monster, Terrain, Affiliation } from "@/app/types/monster";

export type { RelationCriteria, EncounterMode, Difficulty, Ruleset, BudgetMode, BossMinionSuggestion, GroupSuggestion };

type State = {
    partySize: number;
    avgLevel: number;
    difficulty: Difficulty;
    mode: EncounterMode;
    ruleset: Ruleset;
    budgetMode: BudgetMode;
    groupTypes: number;
    includeMinions: boolean;
    relationCriteria: RelationCriteria;
    filterTerrain: Terrain | "";
    filterAffiliation: Affiliation | "";
    filterGenus: string;
    selectedIdx: number;
    expandedIdx: number | null;
};

type Action =
    | { type: "SET_PARTY_SIZE"; payload: number }
    | { type: "SET_AVG_LEVEL"; payload: number }
    | { type: "SET_DIFFICULTY"; payload: Difficulty }
    | { type: "SET_MODE"; payload: EncounterMode }
    | { type: "SET_RULESET"; payload: Ruleset }
    | { type: "SET_BUDGET_MODE"; payload: BudgetMode }
    | { type: "SET_GROUP_TYPES"; payload: number }
    | { type: "SET_INCLUDE_MINIONS"; payload: boolean }
    | { type: "SET_RELATION_CRITERIA"; payload: RelationCriteria }
    | { type: "SET_FILTER_TERRAIN"; payload: Terrain | "" }
    | { type: "SET_FILTER_AFFILIATION"; payload: Affiliation | "" }
    | { type: "SET_FILTER_GENUS"; payload: string }
    | { type: "SET_SELECTED_IDX"; payload: number }
    | { type: "SET_EXPANDED_IDX"; payload: number | null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_PARTY_SIZE":       return { ...state, partySize: action.payload, selectedIdx: 0 };
        case "SET_AVG_LEVEL":        return { ...state, avgLevel: action.payload, selectedIdx: 0 };
        case "SET_DIFFICULTY":       return { ...state, difficulty: action.payload, selectedIdx: 0 };
        case "SET_MODE":             return { ...state, mode: action.payload, selectedIdx: 0 };
        case "SET_RULESET":          return { ...state, ruleset: action.payload, selectedIdx: 0 };
        case "SET_BUDGET_MODE":      return { ...state, budgetMode: action.payload, selectedIdx: 0 };
        case "SET_GROUP_TYPES":      return { ...state, groupTypes: action.payload, selectedIdx: 0 };
        case "SET_INCLUDE_MINIONS":  return { ...state, includeMinions: action.payload, selectedIdx: 0 };
        case "SET_RELATION_CRITERIA":return { ...state, relationCriteria: action.payload, selectedIdx: 0 };
        case "SET_FILTER_TERRAIN":   return { ...state, filterTerrain: action.payload, selectedIdx: 0 };
        case "SET_FILTER_AFFILIATION":return { ...state, filterAffiliation: action.payload, selectedIdx: 0 };
        case "SET_FILTER_GENUS":     return { ...state, filterGenus: action.payload, selectedIdx: 0 };
        case "SET_SELECTED_IDX":     return { ...state, selectedIdx: action.payload };
        case "SET_EXPANDED_IDX":     return { ...state, expandedIdx: action.payload };
        default: return state;
    }
}

function initState(searchParams: URLSearchParams): State {
    const difficulty = searchParams.get("difficulty");
    const mode = searchParams.get("mode");
    const relation = searchParams.get("relation");
    return {
        partySize: Number(searchParams.get("partySize")) || 4,
        avgLevel: Number(searchParams.get("avgLevel")) || 5,
        difficulty: (["easy", "medium", "hard", "deadly"].includes(difficulty ?? "") ? difficulty : "medium") as Difficulty,
        mode: (["solo", "group"].includes(mode ?? "") ? mode : "solo") as EncounterMode,
        ruleset: "2014",
        budgetMode: "encounter",
        groupTypes: 2,
        includeMinions: false,
        relationCriteria: (["any", "terrain", "affiliation", "genus"].includes(relation ?? "") ? relation : "any") as RelationCriteria,
        filterTerrain: (searchParams.get("filterTerrain") as Terrain) || "",
        filterAffiliation: "",
        filterGenus: "",
        selectedIdx: 0,
        expandedIdx: null,
    };
}

export function useEncounterBuilder() {
    const searchParams = useSearchParams();
    const [state, dispatch] = useReducer(reducer, undefined, () => initState(searchParams));

    const { catalog2014, catalog2024 } = useMergedCatalog();
    const catalog = state.ruleset === "2024" ? catalog2024 : catalog2014;

    const knownGenera = useMemo(
        () => [...new Set(catalog.map((m) => m.genus).filter(Boolean) as string[])].sort(),
        [catalog],
    );

    const opts: EncounterServiceOpts = {
        level: state.avgLevel,
        size: state.partySize,
        difficulty: state.difficulty,
        ruleset: state.ruleset,
        budgetMode: state.budgetMode,
        mode: state.mode,
        includeMinions: state.includeMinions,
        groupTypes: state.groupTypes,
        relationCriteria: state.relationCriteria,
    };

    const { budget, soloSuggestions, groupSuggestions } = useMemo(
        () => buildEncounterSuggestions(opts, catalog),
        // Individual fields listed to avoid stale closure on opts object reference
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            state.avgLevel, state.partySize, state.difficulty, state.ruleset,
            state.budgetMode, state.includeMinions, state.groupTypes,
            state.relationCriteria, catalog,
        ],
    );

    const suggestions: (BossMinionSuggestion | GroupSuggestion)[] =
        state.mode === "solo" ? soloSuggestions : groupSuggestions;

    const safeSelectedIdx = Math.min(state.selectedIdx, Math.max(0, suggestions.length - 1));
    const mapSuggestion = suggestions[safeSelectedIdx] ?? null;
    const expandedSuggestion = state.expandedIdx !== null ? suggestions[state.expandedIdx] ?? null : null;

    const hasActiveFilter =
        (state.relationCriteria === "terrain" && !!state.filterTerrain) ||
        (state.relationCriteria === "affiliation" && !!state.filterAffiliation) ||
        (state.relationCriteria === "genus" && !!state.filterGenus);

    const activeFilterLabel = hasActiveFilter
        ? state.relationCriteria === "terrain"
            ? state.filterTerrain
            : state.relationCriteria === "affiliation"
            ? state.filterAffiliation
            : state.filterGenus
        : null;

    const filterMonsterPool = (monsters: Monster[]): Monster[] => {
        if (state.relationCriteria === "terrain" && state.filterTerrain)
            return monsters.filter((m) => m.terrain.includes(state.filterTerrain as Terrain) || m.terrain.includes("any"));
        if (state.relationCriteria === "affiliation" && state.filterAffiliation)
            return monsters.filter((m) => m.affiliation === state.filterAffiliation || m.affiliation === "any");
        if (state.relationCriteria === "genus" && state.filterGenus)
            return monsters.filter((m) => m.genus === state.filterGenus);
        return monsters;
    };

    const showRelationControls = state.mode === "group" || (state.mode === "solo" && state.includeMinions);

    return {
        state,
        dispatch,
        catalog,
        budget,
        suggestions,
        safeSelectedIdx,
        mapSuggestion,
        expandedSuggestion,
        knownGenera,
        filterMonsterPool,
        hasActiveFilter,
        activeFilterLabel,
        showRelationControls,
    };
}
