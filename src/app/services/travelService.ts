import {
    getTravelEncounter,
    rollD500,
    type Terrain,
    type EncounterType,
    type EncounterOutcome,
} from "@/app/utils/travelEncounter";

export type { Terrain, EncounterType, EncounterOutcome };

export type TravelResult = { roll: number; outcome: EncounterOutcome | null };

export function rollEncounter(terrain: Terrain, typeFilter: EncounterType | "all"): TravelResult {
    const roll = rollD500();
    const outcome = getTravelEncounter(terrain, roll, typeFilter);
    return { roll, outcome };
}
