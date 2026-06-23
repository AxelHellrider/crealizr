"use client";

import { useMemo } from "react";
import type { Monster } from "@/app/types/monster";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";

function mergeWithShadow(srd: readonly Monster[], custom: Monster[]): Monster[] {
    const customNames = new Set(custom.map((m) => m.name.toLowerCase()));
    const filtered = srd.filter((m) => !customNames.has(m.name.toLowerCase()));
    return [...filtered, ...custom];
}

export function useMergedCatalog() {
    const { customMonsters } = useCustomMonsters();

    return useMemo(() => {
        const custom2014 = customMonsters.filter((m) => m.edition === "2014");
        const custom2024 = customMonsters.filter((m) => m.edition === "2024");

        return {
            catalog2014: mergeWithShadow(MONSTER_MANUAL_2014_CATALOG, custom2014),
            catalog2024: mergeWithShadow(MONSTER_MANUAL_2024_CATALOG, custom2024),
        };
    }, [customMonsters]);
}
