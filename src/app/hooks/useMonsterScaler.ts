"use client";

import { useReducer, useTransition, useMemo } from "react";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import { scaleMonster, type ScaleOptions } from "@/app/services/scalerService";
import type { ACSource } from "@/app/utils/scaler";
import type { MonsterBase, Edition } from "@/app/types/monster";

const DEFAULT_MONSTER: MonsterBase = {
    name: "",
    edition: "2014",
    size: "Medium",
    type: "",
    dpr: { min: 1, max: 1, range: "" },
    alignment: "Unaligned",
    cr: 0.125,
    terrain: ["any"],
    affiliation: "any",
    xp: 0,
    stats: { ac: 10, hp: 1, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, speed: "30 ft" },
    raw_source_ref: "",
};

type AbilityBonus = ScaleOptions["abilityScoreBonus"];

type State = {
    monster: MonsterBase;
    edition: Edition;
    targetCR: number | null;
    scaledMonster: MonsterBase | null;
    acSource: ACSource;
    armorBonus: number;
    naturalArmor: number;
    hasShield: boolean;
    abilityBonus: AbilityBonus;
    catalogSearch: string;
    saved: boolean;
};

const initialState: State = {
    monster: DEFAULT_MONSTER,
    edition: "2014",
    targetCR: null,
    scaledMonster: null,
    acSource: "dex",
    armorBonus: 0,
    naturalArmor: 10,
    hasShield: false,
    abilityBonus: {},
    catalogSearch: "",
    saved: false,
};

type Action =
    | { type: "SET_MONSTER"; payload: MonsterBase }
    | { type: "SET_EDITION"; payload: Edition }
    | { type: "SET_TARGET_CR"; payload: number | null }
    | { type: "SET_AC_SOURCE"; payload: ACSource }
    | { type: "SET_ARMOR_BONUS"; payload: number }
    | { type: "SET_NATURAL_ARMOR"; payload: number }
    | { type: "SET_HAS_SHIELD"; payload: boolean }
    | { type: "SET_CATALOG_SEARCH"; payload: string }
    | { type: "SET_SAVED"; payload: boolean }
    | { type: "LOAD_FROM_CATALOG"; payload: Partial<MonsterBase> & { edition: Edition } }
    | { type: "STAT_CHANGE"; payload: { stat: keyof MonsterBase["stats"]; value: number | string } }
    | { type: "ABILITY_BONUS_CHANGE"; payload: { stat: keyof MonsterBase["stats"]; value: number } }
    | { type: "SCALE_RESULT"; payload: MonsterBase }
    | { type: "RESET_TO_FORM" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_MONSTER":
            return { ...state, monster: action.payload };
        case "SET_EDITION":
            return { ...state, edition: action.payload };
        case "SET_TARGET_CR":
            return { ...state, targetCR: action.payload };
        case "SET_AC_SOURCE":
            return { ...state, acSource: action.payload };
        case "SET_ARMOR_BONUS":
            return { ...state, armorBonus: action.payload };
        case "SET_NATURAL_ARMOR":
            return { ...state, naturalArmor: action.payload };
        case "SET_HAS_SHIELD":
            return { ...state, hasShield: action.payload };
        case "SET_CATALOG_SEARCH":
            return { ...state, catalogSearch: action.payload };
        case "SET_SAVED":
            return { ...state, saved: action.payload };
        case "LOAD_FROM_CATALOG":
            return {
                ...state,
                monster: { ...state.monster, ...action.payload },
                edition: action.payload.edition,
                targetCR: null,
                scaledMonster: null,
                catalogSearch: "",
                saved: false,
            };
        case "STAT_CHANGE":
            return {
                ...state,
                monster: {
                    ...state.monster,
                    stats: { ...state.monster.stats, [action.payload.stat]: action.payload.value },
                },
            };
        case "ABILITY_BONUS_CHANGE":
            return {
                ...state,
                abilityBonus: { ...state.abilityBonus, [action.payload.stat]: action.payload.value },
            };
        case "SCALE_RESULT":
            return { ...state, scaledMonster: action.payload };
        case "RESET_TO_FORM":
            return { ...state, scaledMonster: null, saved: false };
        default:
            return state;
    }
}

export function useMonsterScaler() {
    const { catalog2014, catalog2024 } = useMergedCatalog();
    const [isScaling, startScaling] = useTransition();
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        monster, edition, targetCR, scaledMonster,
        acSource, armorBonus, naturalArmor, hasShield, abilityBonus, catalogSearch, saved,
    } = state;

    const allMonsters = useMemo(() => {
        const combined = [...catalog2014, ...catalog2024];
        const seen = new Set<string>();
        return combined.filter((m) => {
            const key = `${m.name}|${m.edition}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [catalog2014, catalog2024]);

    const handleLoadFromCatalog = (name: string) => {
        const match = allMonsters.find((m) => m.name === name);
        if (!match) return;
        const ed = (match.edition ?? "2014") as Edition;
        dispatch({
            type: "LOAD_FROM_CATALOG",
            payload: {
                name: match.name,
                type: match.type ?? match.affiliation ?? monster.type,
                cr: match.cr,
                edition: ed,
                terrain: match.terrain,
                affiliation: match.affiliation,
                genus: match.genus,
                size: match.size ?? monster.size,
                stats: match.stats ?? monster.stats,
                actions: match.actions ?? monster.actions,
            },
        });
    };

    const handleStatChange = (stat: keyof MonsterBase["stats"], value: number | string) => {
        dispatch({ type: "STAT_CHANGE", payload: { stat, value } });
    };

    const handleAbilityBonusChange = (stat: keyof MonsterBase["stats"], value: number) => {
        dispatch({ type: "ABILITY_BONUS_CHANGE", payload: { stat, value } });
    };

    const handleScale = () => {
        if (targetCR === null) return;
        startScaling(() => {
            const result = scaleMonster(
                { ...monster, edition },
                targetCR,
                { acSource, armorBonus, naturalArmor, hasShield, abilityScoreBonus: abilityBonus },
            );
            dispatch({ type: "SCALE_RESULT", payload: result });
        });
    };

    const resetToForm = () => dispatch({ type: "RESET_TO_FORM" });

    return {
        monster, setMonster: (payload: MonsterBase) => dispatch({ type: "SET_MONSTER", payload }),
        edition, setEdition: (payload: Edition) => dispatch({ type: "SET_EDITION", payload }),
        targetCR, setTargetCR: (payload: number | null) => dispatch({ type: "SET_TARGET_CR", payload }),
        scaledMonster,
        acSource, setAcSource: (payload: ACSource) => dispatch({ type: "SET_AC_SOURCE", payload }),
        armorBonus, setArmorBonus: (payload: number) => dispatch({ type: "SET_ARMOR_BONUS", payload }),
        naturalArmor, setNaturalArmor: (payload: number) => dispatch({ type: "SET_NATURAL_ARMOR", payload }),
        hasShield, setHasShield: (payload: boolean) => dispatch({ type: "SET_HAS_SHIELD", payload }),
        abilityBonus,
        catalogSearch, setCatalogSearch: (payload: string) => dispatch({ type: "SET_CATALOG_SEARCH", payload }),
        saved, setSaved: (payload: boolean) => dispatch({ type: "SET_SAVED", payload }),
        allMonsters,
        isScaling,
        handleLoadFromCatalog,
        handleStatChange,
        handleAbilityBonusChange,
        handleScale,
        resetToForm,
    };
}
