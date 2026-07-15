import type { ConditionId } from "@/app/data/conditions";

export type DeathSaves = {
    successes: number;
    failures: number;
};

export interface Combatant {
    /** Generated fresh when combat starts — independent of hex node ids, since
     * nodes can be moved/removed on the map after combat is already running. */
    id: string;
    name: string;
    kind: "party" | "enemy";
    isBoss?: boolean;
    initiative: number | null;
    maxHP: number | null;
    currentHP: number | null;
    conditions: ConditionId[];
    /** Party members only, tracked once currentHP drops to 0. */
    deathSaves?: DeathSaves;
}

export interface CombatState {
    round: number;
    /** Index into `combatants` sorted by initiative descending — not a stable id,
     * recomputed against the sorted order each render. */
    turnIndex: number;
    combatants: Combatant[];
}
