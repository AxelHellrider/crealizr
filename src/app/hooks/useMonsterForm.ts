"use client";

import { useReducer } from "react";
import type { Monster, Terrain, Affiliation, Edition, MonsterSize, MonsterAction } from "@/app/types/monster";
import type { AbilityScores } from "@/app/components/molecules/AbilityScoreGrid";
import { clamp } from "@/app/lib/number";

export type MonsterFormState = {
    name: string;
    cr: number;
    edition: Edition;
    terrain: Terrain[];
    affiliation: Affiliation;
    genus: string;
    showStats: boolean;
    size: MonsterSize;
    type: string;
    alignment: string;
    ac: number;
    hp: number;
    speed: string;
    abilityScores: AbilityScores;
    dprMin: number;
    dprMax: number;
    dprRange: string;
    xp: number;
    actions: MonsterAction[];
    error: string;
};

export type MonsterFormAction =
    | { type: "SET_NAME"; value: string }
    | { type: "SET_CR"; value: number }
    | { type: "SET_EDITION"; value: Edition }
    | { type: "SET_TERRAIN"; value: Terrain[] }
    | { type: "SET_AFFILIATION"; value: Affiliation }
    | { type: "SET_GENUS"; value: string }
    | { type: "SET_SIZE"; value: MonsterSize }
    | { type: "SET_TYPE"; value: string }
    | { type: "SET_ALIGNMENT"; value: string }
    | { type: "SET_AC"; value: number }
    | { type: "SET_HP"; value: number }
    | { type: "SET_SPEED"; value: string }
    | { type: "SET_ABILITY_SCORE"; key: keyof AbilityScores; value: number }
    | { type: "SET_DPR_MIN"; value: number }
    | { type: "SET_DPR_MAX"; value: number }
    | { type: "SET_DPR_RANGE"; value: string }
    | { type: "SET_XP"; value: number }
    | { type: "UPDATE_ACTION"; index: number; patch: Partial<MonsterAction> }
    | { type: "REMOVE_ACTION"; index: number }
    | { type: "ADD_ACTION" }
    | { type: "SET_ERROR"; value: string };

/** Validation/duplicate-name error messages, localized by the caller. */
export type MonsterFormMessages = {
    nameRequired: string;
    nameDuplicate: string;
};

function initFormState(initial?: Monster): MonsterFormState {
    return {
        name: initial?.name ?? "",
        cr: initial?.cr ?? 1,
        edition: initial?.edition ?? "2014",
        terrain: initial?.terrain ?? ["any"],
        affiliation: initial?.affiliation ?? "humanoid",
        genus: initial?.genus ?? "",
        showStats: !!initial?.stats,
        size: initial?.size ?? "Medium",
        type: initial?.type ?? "",
        alignment: initial?.alignment ?? "",
        ac: initial?.stats?.ac ?? 10,
        hp: initial?.stats?.hp ?? 10,
        speed: initial?.stats?.speed ?? "30 ft",
        abilityScores: {
            str: initial?.stats?.str ?? 10,
            dex: initial?.stats?.dex ?? 10,
            con: initial?.stats?.con ?? 10,
            int: initial?.stats?.int ?? 10,
            wis: initial?.stats?.wis ?? 10,
            cha: initial?.stats?.cha ?? 10,
        },
        dprMin: initial?.dpr?.min ?? 0,
        dprMax: initial?.dpr?.max ?? 0,
        dprRange: initial?.dpr?.range ?? "",
        xp: initial?.xp ?? 0,
        actions: initial?.actions ?? [],
        error: "",
    };
}

function formReducer(state: MonsterFormState, action: MonsterFormAction): MonsterFormState {
    switch (action.type) {
        case "SET_NAME":
            return { ...state, name: action.value, error: "" };
        case "SET_CR":
            return { ...state, cr: action.value };
        case "SET_EDITION":
            return { ...state, edition: action.value };
        case "SET_TERRAIN":
            return { ...state, terrain: action.value };
        case "SET_AFFILIATION":
            return { ...state, affiliation: action.value };
        case "SET_GENUS":
            return { ...state, genus: action.value };
        case "SET_SIZE":
            return { ...state, size: action.value, showStats: true };
        case "SET_TYPE":
            return { ...state, type: action.value };
        case "SET_ALIGNMENT":
            return { ...state, alignment: action.value };
        case "SET_AC":
            return { ...state, ac: clamp(action.value, 0, 30), showStats: true };
        case "SET_HP":
            return { ...state, hp: Math.max(0, action.value), showStats: true };
        case "SET_SPEED":
            return { ...state, speed: action.value, showStats: true };
        case "SET_ABILITY_SCORE":
            return { ...state, abilityScores: { ...state.abilityScores, [action.key]: action.value }, showStats: true };
        case "SET_DPR_MIN":
            return { ...state, dprMin: Math.max(0, action.value) };
        case "SET_DPR_MAX":
            return { ...state, dprMax: Math.max(0, action.value) };
        case "SET_DPR_RANGE":
            return { ...state, dprRange: action.value };
        case "SET_XP":
            return { ...state, xp: Math.max(0, action.value) };
        case "UPDATE_ACTION": {
            const actions = [...state.actions];
            actions[action.index] = { ...actions[action.index], ...action.patch };
            return { ...state, actions };
        }
        case "REMOVE_ACTION":
            return { ...state, actions: state.actions.filter((_, j) => j !== action.index) };
        case "ADD_ACTION":
            return { ...state, actions: [...state.actions, { name: "" }] };
        case "SET_ERROR":
            return { ...state, error: action.value };
        default:
            return state;
    }
}

/** Builds a Monster from validated form state, ready to save. */
function buildMonster(state: MonsterFormState, name: string): Monster {
    const { cr, edition, terrain, affiliation, genus, showStats, size, type, alignment, ac, hp, speed, abilityScores, dprMin, dprMax, dprRange, xp, actions } = state;

    const monster: Monster = {
        name,
        cr,
        edition,
        terrain,
        affiliation,
        genus: genus || undefined,
        source: "homebrew",
    };

    if (showStats) {
        monster.size = size;
        monster.type = type || undefined;
        monster.alignment = alignment || undefined;
        monster.xp = xp;
        monster.stats = { ac, hp, speed, ...abilityScores };
        monster.dpr = { min: dprMin, max: dprMax, range: dprRange };
        if (actions.length > 0) monster.actions = actions;
    }

    return monster;
}

/**
 * Owns the My Bestiary add/edit form's state, validation, and submit flow.
 * Name-uniqueness and required-field errors are surfaced via `state.error`.
 */
export function useMonsterForm(
    initial: Monster | undefined,
    existingNames: Set<string>,
    onSave: (monster: Monster) => void,
    messages: MonsterFormMessages,
) {
    const [state, dispatch] = useReducer(formReducer, initial, initFormState);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = state.name.trim();
        if (!trimmed) {
            dispatch({ type: "SET_ERROR", value: messages.nameRequired });
            return;
        }
        if (!initial && existingNames.has(trimmed.toLowerCase())) {
            dispatch({ type: "SET_ERROR", value: messages.nameDuplicate });
            return;
        }
        if (initial && trimmed.toLowerCase() !== initial.name.toLowerCase() && existingNames.has(trimmed.toLowerCase())) {
            dispatch({ type: "SET_ERROR", value: messages.nameDuplicate });
            return;
        }

        onSave(buildMonster(state, trimmed));
    }

    return { state, dispatch, handleSubmit };
}
