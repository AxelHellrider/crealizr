import type { ConditionId } from "@/app/data/conditions";
import type { MonsterAction } from "@/app/types/monster";

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
    /** The encounter slot's challenge rating (enemies only) — used to sort/filter
     * the "swap monster" picker toward creatures of a similar CR. */
    cr: number | null;
    /** Which catalog monster this combatant currently represents (enemies only) —
     * a name, not an id, since official catalog entries don't have stable ids.
     * Drives the AC/actions/dexMod snapshot below; null means the DM never
     * assigned one (no catalog match, or a homebrew placeholder). */
    monsterName: string | null;
    ac: number | null;
    /** Snapshot of the assigned monster's actions at assignment time, for
     * quick reference during the fight — not kept live-synced to the catalog. */
    actions: MonsterAction[];
    initiative: number | null;
    /** DEX modifier added on top of the die when rolling initiative — persists
     * across rerolls so the DM only has to enter it once per combatant. */
    dexMod: number | null;
    /** The raw 1d20 result from the last roll, kept alongside `initiative`
     * (roll + dexMod) so the breakdown can be shown. Cleared (null) when
     * `initiative` is edited by hand instead of rolled. */
    initiativeRoll: number | null;
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
