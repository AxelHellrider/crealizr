"use client";

import { useState, useMemo } from "react";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import { rollEncounter, type Terrain, type EncounterType, type TravelResult } from "@/app/services/travelService";
import { TERRAINS } from "@/app/utils/travelEncounter";
import type { Monster } from "@/app/types/monster";

type CatalogTerrain = Monster["terrain"][number];

const TERRAIN_TO_CATALOG: Record<Terrain, CatalogTerrain[]> = {
    Forest:     ["wilderness"],
    Desert:     ["wilderness"],
    Mountains:  ["wilderness"],
    Plains:     ["wilderness"],
    Swamp:      ["wilderness"],
    Arctic:     ["wilderness"],
    Coast:      ["wilderness", "underwater"],
    Underdark:  ["dungeon"],
};

export { TERRAINS };
export type { Terrain, EncounterType, TravelResult };

export function useTravelEncounters() {
    const [terrain, setTerrain] = useState<Terrain>("Forest");
    const [typeFilter, setTypeFilter] = useState<EncounterType | "all">("all");
    const [result, setResult] = useState<TravelResult | null>(null);
    const [partySize, setPartySize] = useState(4);
    const [avgLevel, setAvgLevel] = useState(5);
    const [showTables, setShowTables] = useState(false);

    const { catalog2014 } = useMergedCatalog();

    const terrainMonsters = useMemo(() => {
        const catalogTerrains = TERRAIN_TO_CATALOG[terrain];
        return catalog2014.filter((m) =>
            m.terrain.some((t) => catalogTerrains.includes(t as CatalogTerrain)),
        );
    }, [catalog2014, terrain]);

    const roll = () => {
        const outcome = rollEncounter(terrain, typeFilter);
        setResult(outcome);

        const message = outcome.outcome
            ? `Rolled ${outcome.roll}. Outcome: ${outcome.outcome.description}. Type: ${outcome.outcome.type}.`
            : `Rolled ${outcome.roll}. No outcome found.`;
        const announcer = document.getElementById("sr-announcer");
        if (announcer) announcer.textContent = message;
    };

    const builderParams = (locale: string) =>
        `/${locale}/encounter-builder?partySize=${partySize}&avgLevel=${avgLevel}&difficulty=medium&mode=group&relation=terrain&filterTerrain=${TERRAIN_TO_CATALOG[terrain][0]}`;

    return {
        terrain, setTerrain,
        typeFilter, setTypeFilter,
        result,
        partySize, setPartySize,
        avgLevel, setAvgLevel,
        showTables, setShowTables,
        terrainMonsters,
        roll,
        builderParams,
    };
}
