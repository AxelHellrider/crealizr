import { describe, it, expect } from "vitest";
import { sortByInitiative, advanceTurn, applyCombatantPatch } from "@/app/utils/combatLogic";
import type { Combatant, CombatState } from "@/app/types/combat";

function makeCombatant(overrides: Partial<Combatant> = {}): Combatant {
    return {
        id: "c1",
        name: "Test",
        kind: "party",
        cr: null,
        monsterName: null,
        ac: null,
        actions: [],
        initiative: null,
        dexMod: null,
        initiativeRoll: null,
        maxHP: 10,
        currentHP: 10,
        conditions: [],
        ...overrides,
    };
}

describe("sortByInitiative", () => {
    it("sorts descending by initiative", () => {
        const a = makeCombatant({ id: "a", initiative: 5 });
        const b = makeCombatant({ id: "b", initiative: 20 });
        const c = makeCombatant({ id: "c", initiative: 10 });
        expect(sortByInitiative([a, b, c]).map((x) => x.id)).toEqual(["b", "c", "a"]);
    });

    it("sorts combatants with no initiative to the end", () => {
        const rolled = makeCombatant({ id: "rolled", initiative: 8 });
        const unrolled = makeCombatant({ id: "unrolled", initiative: null });
        expect(sortByInitiative([unrolled, rolled]).map((x) => x.id)).toEqual(["rolled", "unrolled"]);
    });
});

describe("advanceTurn", () => {
    const state: CombatState = {
        round: 1,
        turnIndex: 0,
        combatants: [makeCombatant({ id: "a" }), makeCombatant({ id: "b" }), makeCombatant({ id: "c" })],
    };

    it("advances the turn index within a round", () => {
        const next = advanceTurn(state, "next");
        expect(next.turnIndex).toBe(1);
        expect(next.round).toBe(1);
    });

    it("wraps to the next round after the last combatant's turn", () => {
        const last = { ...state, turnIndex: 2 };
        const next = advanceTurn(last, "next");
        expect(next.turnIndex).toBe(0);
        expect(next.round).toBe(2);
    });

    it("rewinds within a round", () => {
        const mid = { ...state, turnIndex: 1 };
        const prev = advanceTurn(mid, "prev");
        expect(prev.turnIndex).toBe(0);
        expect(prev.round).toBe(1);
    });

    it("wraps to the previous round (and never below round 1) when rewinding past the first turn", () => {
        const first = { ...state, turnIndex: 0, round: 2 };
        const prev = advanceTurn(first, "prev");
        expect(prev.turnIndex).toBe(2);
        expect(prev.round).toBe(1);

        const alreadyRoundOne = { ...state, turnIndex: 0, round: 1 };
        const stillOne = advanceTurn(alreadyRoundOne, "prev");
        expect(stillOne.round).toBe(1);
    });

    it("is a no-op with zero combatants", () => {
        const empty: CombatState = { round: 1, turnIndex: 0, combatants: [] };
        expect(advanceTurn(empty, "next")).toBe(empty);
    });
});

describe("applyCombatantPatch", () => {
    it("merges a plain patch", () => {
        const c = makeCombatant();
        const next = applyCombatantPatch(c, { name: "New Name" });
        expect(next.name).toBe("New Name");
    });

    it("clears death saves once a downed combatant regains HP", () => {
        const downed = makeCombatant({ currentHP: 0, deathSaves: { successes: 2, failures: 1 } });
        const healed = applyCombatantPatch(downed, { currentHP: 5 });
        expect(healed.deathSaves).toBeUndefined();
    });

    it("leaves death saves alone when HP changes but stays at or below 0", () => {
        const downed = makeCombatant({ currentHP: 0, deathSaves: { successes: 1, failures: 1 } });
        const stillDown = applyCombatantPatch(downed, { currentHP: 0 });
        expect(stillDown.deathSaves).toEqual({ successes: 1, failures: 1 });
    });

    it("leaves death saves alone for a combatant that wasn't already at 0 HP", () => {
        const healthy = makeCombatant({ currentHP: 8 });
        const next = applyCombatantPatch(healthy, { currentHP: 10 });
        expect(next.deathSaves).toBeUndefined();
    });
});
