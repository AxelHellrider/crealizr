"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { CombatState, Combatant } from "@/app/types/combat";
import type { ConditionId } from "@/app/data/conditions";
import { loadCombat, saveCombat, clearCombat } from "@/app/lib/combatDB";
import { rollD20 } from "@/app/utils/dice";
import { newId } from "@/app/lib/id";

type NewCombatant = Omit<Combatant, "id" | "initiative" | "conditions"> & {
    initiative?: number | null;
    conditions?: ConditionId[];
};

type CombatContextValue = {
    combat: CombatState | null;
    loading: boolean;
    /** Sorted by initiative descending (nulls last) — the actual turn order. */
    turnOrder: Combatant[];
    activeCombatant: Combatant | null;
    startCombat: (seed: NewCombatant[]) => void;
    endCombat: () => void;
    addCombatant: (seed: NewCombatant) => void;
    removeCombatant: (id: string) => void;
    updateCombatant: (id: string, patch: Partial<Combatant>) => void;
    rollInitiative: (id: string) => void;
    rollAllInitiative: () => void;
    nextTurn: () => void;
    prevTurn: () => void;
};

const CombatContext = createContext<CombatContextValue | null>(null);

function sortByInitiative(combatants: Combatant[]): Combatant[] {
    return [...combatants].sort((a, b) => {
        if (a.initiative === null && b.initiative === null) return 0;
        if (a.initiative === null) return 1;
        if (b.initiative === null) return -1;
        return b.initiative - a.initiative;
    });
}

export function CombatProvider({ children }: { children: ReactNode }) {
    const [combat, setCombat] = useState<CombatState | null>(null);
    const [loading, setLoading] = useState(true);
    const hydrated = useRef(false);

    useEffect(() => {
        loadCombat()
            .then(setCombat)
            .catch(() => setCombat(null))
            .finally(() => {
                hydrated.current = true;
                setLoading(false);
            });
    }, []);

    // Debounced persistence, same pattern as the hex layout's localStorage
    // writes — avoids hammering IndexedDB on every HP keystroke.
    useEffect(() => {
        if (!hydrated.current) return;
        const id = setTimeout(() => {
            if (combat) saveCombat(combat).catch(() => { /* storage unavailable — skip */ });
            else clearCombat().catch(() => { /* storage unavailable — skip */ });
        }, 250);
        return () => clearTimeout(id);
    }, [combat]);

    const startCombat = useCallback((seed: NewCombatant[]) => {
        const combatants: Combatant[] = seed.map((c) => ({
            ...c,
            id: newId(),
            initiative: c.initiative ?? null,
            conditions: c.conditions ?? [],
        }));
        setCombat({ round: 1, turnIndex: 0, combatants });
    }, []);

    const endCombat = useCallback(() => setCombat(null), []);

    const addCombatant = useCallback((seed: NewCombatant) => {
        setCombat((prev) => {
            const combatant: Combatant = {
                ...seed,
                id: newId(),
                initiative: seed.initiative ?? null,
                conditions: seed.conditions ?? [],
            };
            if (!prev) return { round: 1, turnIndex: 0, combatants: [combatant] };
            return { ...prev, combatants: [...prev.combatants, combatant] };
        });
    }, []);

    const removeCombatant = useCallback((id: string) => {
        setCombat((prev) => prev && { ...prev, combatants: prev.combatants.filter((c) => c.id !== id) });
    }, []);

    const updateCombatant = useCallback((id: string, patch: Partial<Combatant>) => {
        setCombat((prev) => prev && {
            ...prev,
            combatants: prev.combatants.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        });
    }, []);

    const rollInitiative = useCallback((id: string) => {
        updateCombatant(id, { initiative: rollD20() });
    }, [updateCombatant]);

    const rollAllInitiative = useCallback(() => {
        setCombat((prev) => prev && {
            ...prev,
            combatants: prev.combatants.map((c) => ({ ...c, initiative: rollD20() })),
        });
    }, []);

    const nextTurn = useCallback(() => {
        setCombat((prev) => {
            if (!prev || prev.combatants.length === 0) return prev;
            const nextIndex = prev.turnIndex + 1;
            if (nextIndex >= prev.combatants.length) return { ...prev, round: prev.round + 1, turnIndex: 0 };
            return { ...prev, turnIndex: nextIndex };
        });
    }, []);

    const prevTurn = useCallback(() => {
        setCombat((prev) => {
            if (!prev || prev.combatants.length === 0) return prev;
            if (prev.turnIndex === 0) return { ...prev, round: Math.max(1, prev.round - 1), turnIndex: prev.combatants.length - 1 };
            return { ...prev, turnIndex: prev.turnIndex - 1 };
        });
    }, []);

    const turnOrder = combat ? sortByInitiative(combat.combatants) : [];
    const activeCombatant = combat ? (turnOrder[combat.turnIndex] ?? null) : null;

    return (
        <CombatContext value={{
            combat,
            loading,
            turnOrder,
            activeCombatant,
            startCombat,
            endCombat,
            addCombatant,
            removeCombatant,
            updateCombatant,
            rollInitiative,
            rollAllInitiative,
            nextTurn,
            prevTurn,
        }}>
            {children}
        </CombatContext>
    );
}

export function useCombat(): CombatContextValue {
    const ctx = useContext(CombatContext);
    if (!ctx) throw new Error("useCombat must be used within CombatProvider");
    return ctx;
}
