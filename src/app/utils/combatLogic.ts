import type { CombatState, Combatant } from "@/app/types/combat";

/** Fills in any fields missing from a persisted combatant record with safe
 * defaults. Combatant has grown fields over time (cr/monsterName/ac/actions,
 * then dexMod/initiativeRoll) — a combat saved to IndexedDB before one of
 * those existed won't have it, and reading `undefined.length` etc. on that
 * missing field crashes the tracker. Loading is the one boundary where data
 * this old can still show up, so it's normalized right there. */
export function migrateCombatant(raw: Partial<Combatant> & Pick<Combatant, "id" | "name" | "kind">): Combatant {
    return {
        ...raw,
        cr: raw.cr ?? null,
        monsterName: raw.monsterName ?? null,
        ac: raw.ac ?? null,
        actions: raw.actions ?? [],
        initiative: raw.initiative ?? null,
        dexMod: raw.dexMod ?? null,
        initiativeRoll: raw.initiativeRoll ?? null,
        maxHP: raw.maxHP ?? null,
        currentHP: raw.currentHP ?? null,
        conditions: raw.conditions ?? [],
    };
}

/** Fills in any fields missing from a persisted combat session — see
 * `migrateCombatant`. Safe to call on already-current data (no-op). */
export function migrateCombatState(state: CombatState): CombatState {
    return { ...state, combatants: state.combatants.map(migrateCombatant) };
}

/** Sorted by initiative descending (nulls last) — the actual turn order. */
export function sortByInitiative(combatants: Combatant[]): Combatant[] {
    return [...combatants].sort((a, b) => {
        if (a.initiative === null && b.initiative === null) return 0;
        if (a.initiative === null) return 1;
        if (b.initiative === null) return -1;
        return b.initiative - a.initiative;
    });
}

/** Advances or rewinds the turn index, wrapping the round counter at either end. */
export function advanceTurn(state: CombatState, direction: "next" | "prev"): CombatState {
    if (state.combatants.length === 0) return state;
    if (direction === "next") {
        const nextIndex = state.turnIndex + 1;
        if (nextIndex >= state.combatants.length) return { ...state, round: state.round + 1, turnIndex: 0 };
        return { ...state, turnIndex: nextIndex };
    }
    if (state.turnIndex === 0) return { ...state, round: Math.max(1, state.round - 1), turnIndex: state.combatants.length - 1 };
    return { ...state, turnIndex: state.turnIndex - 1 };
}

/** Merges a patch into a combatant, applying the one piece of derived game
 * logic that isn't a plain field overwrite: death saves only matter at 0 HP
 * (PHB "Death Saving Throws") — once a creature has HP again, prior
 * successes/failures are moot. Without this, healing above 0 and later
 * dropping back to 0 would resume counting from stale pips instead of a
 * fresh set. */
export function applyCombatantPatch(combatant: Combatant, patch: Partial<Combatant>): Combatant {
    const next = { ...combatant, ...patch };
    if (patch.currentHP != null && patch.currentHP > 0 && (combatant.currentHP ?? 0) <= 0) {
        next.deathSaves = undefined;
    }
    return next;
}
