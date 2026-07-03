"use client";

import { useEffect, useReducer, useRef } from "react";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import type { EncounterNode, EnemyNode, PartyNode, GridCoord, ManualNode, NodeKind, HazardNode, CoverNode } from "@/app/types/encounterLayout";

type Mode = "solo" | "group";

const STORAGE_KEY = "crealizr.encounterLayout.v1";
const PARTY_COLS: [number, number] = [0, 1];
const ENEMY_COLS: [number, number] = [6, 7];
const MAX_SEARCH_ROWS = 1000;

type State = { nodes: EncounterNode[] };

type Action =
    | { type: "SET_FROM_SUGGESTION"; partySize: number; suggestion: GroupSuggestion | BossMinionSuggestion | null; mode: Mode }
    | { type: "MOVE_NODE"; id: string; coord: GridCoord }
    | { type: "ADD_NODE"; node: ManualNode }
    | { type: "UPDATE_NODE"; id: string; patch: Partial<ManualNode> }
    | { type: "REMOVE_NODE"; id: string }
    | { type: "HYDRATE"; nodes: EncounterNode[] };

function newId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `n-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function slotCoord(cols: [number, number], index: number): GridCoord {
    return { col: cols[index % 2], row: Math.floor(index / 2) };
}

function isOccupied(nodes: EncounterNode[], coord: GridCoord, excludeId?: string): boolean {
    return nodes.some((n) => n.id !== excludeId && n.coord.col === coord.col && n.coord.row === coord.row);
}

function firstFreeCoord(nodes: EncounterNode[]): GridCoord {
    for (let row = 0; row < MAX_SEARCH_ROWS; row++) {
        for (let col = 2; col <= 5; col++) {
            const coord = { col, row };
            if (!isOccupied(nodes, coord)) return coord;
        }
    }
    return { col: 2, row: 0 };
}

function regenerateAutoNodes(
    existing: EncounterNode[],
    partySize: number,
    suggestion: GroupSuggestion | BossMinionSuggestion | null,
    mode: Mode,
): EncounterNode[] {
    const manualNodes = existing.filter((n): n is ManualNode => n.kind === "hazard" || n.kind === "cover");
    const prevParty = existing.filter((n): n is PartyNode => n.kind === "party");
    const prevEnemy = existing.filter((n): n is EnemyNode => n.kind === "enemy");

    const partyNodes: PartyNode[] = Array.from({ length: Math.min(partySize, 8) }, (_, i) => {
        const prev = prevParty[i];
        return prev ?? { id: newId(), kind: "party", coord: slotCoord(PARTY_COLS, i) };
    });

    const enemyUnits: { cr: number; isBoss: boolean }[] = [];
    if (suggestion) {
        if (mode === "solo") {
            const s = suggestion as BossMinionSuggestion;
            for (let i = 0; i < s.boss.count; i++) enemyUnits.push({ cr: s.boss.cr, isBoss: true });
            for (const m of s.minions) for (let i = 0; i < m.count; i++) enemyUnits.push({ cr: m.cr, isBoss: false });
        } else {
            const s = suggestion as GroupSuggestion;
            for (const m of s.members) for (let i = 0; i < m.count; i++) enemyUnits.push({ cr: m.cr, isBoss: false });
        }
    }

    const enemyNodes: EnemyNode[] = enemyUnits.map((unit, i) => {
        const prev = prevEnemy[i];
        const coord = prev?.coord ?? slotCoord(ENEMY_COLS, i);
        return prev
            ? { ...prev, cr: unit.cr, isBoss: unit.isBoss }
            : { id: newId(), kind: "enemy", coord, cr: unit.cr, isBoss: unit.isBoss };
    });

    return [...partyNodes, ...enemyNodes, ...manualNodes];
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_FROM_SUGGESTION":
            return { nodes: regenerateAutoNodes(state.nodes, action.partySize, action.suggestion, action.mode) };
        case "MOVE_NODE": {
            if (isOccupied(state.nodes, action.coord, action.id)) return state;
            return { nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, coord: action.coord } : n)) };
        }
        case "ADD_NODE":
            return { nodes: [...state.nodes, action.node] };
        case "UPDATE_NODE":
            return {
                nodes: state.nodes.map((n) =>
                    n.id === action.id && (n.kind === "hazard" || n.kind === "cover") ? ({ ...n, ...action.patch } as EncounterNode) : n,
                ),
            };
        case "REMOVE_NODE":
            return { nodes: state.nodes.filter((n) => n.id !== action.id) };
        case "HYDRATE":
            return { nodes: action.nodes };
        default:
            return state;
    }
}

export function useEncounterLayout(partySize: number, suggestion: GroupSuggestion | BossMinionSuggestion | null, mode: Mode) {
    const [state, dispatch] = useReducer(reducer, { nodes: [] });
    const hydrated = useRef(false);

    useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) dispatch({ type: "HYDRATE", nodes: JSON.parse(raw) as EncounterNode[] });
        } catch {
            // corrupted or inaccessible storage — start from an empty layout
        }
    }, []);

    useEffect(() => {
        dispatch({ type: "SET_FROM_SUGGESTION", partySize, suggestion, mode });
    }, [partySize, suggestion, mode]);

    useEffect(() => {
        const id = setTimeout(() => {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.nodes));
            } catch {
                // storage unavailable (e.g. private mode quota) — silently skip persistence
            }
        }, 250);
        return () => clearTimeout(id);
    }, [state.nodes]);

    function addNode(kind: "hazard", extra: Omit<HazardNode, "id" | "kind" | "coord">, coord?: GridCoord): HazardNode;
    function addNode(kind: "cover", extra: Omit<CoverNode, "id" | "kind" | "coord">, coord?: GridCoord): CoverNode;
    function addNode(
        kind: Extract<NodeKind, "hazard" | "cover">,
        extra: Omit<HazardNode, "id" | "kind" | "coord"> | Omit<CoverNode, "id" | "kind" | "coord">,
        coord?: GridCoord,
    ): ManualNode {
        const node = {
            id: newId(),
            kind,
            coord: coord ?? firstFreeCoord(state.nodes),
            ...extra,
        } as ManualNode;
        dispatch({ type: "ADD_NODE", node });
        return node;
    }

    return {
        nodes: state.nodes,
        moveNode: (id: string, coord: GridCoord) => dispatch({ type: "MOVE_NODE", id, coord }),
        addNode,
        updateNode: (id: string, patch: Partial<ManualNode>) => dispatch({ type: "UPDATE_NODE", id, patch }),
        removeNode: (id: string) => dispatch({ type: "REMOVE_NODE", id }),
        isOccupied: (coord: GridCoord, excludeId?: string) => isOccupied(state.nodes, coord, excludeId),
    };
}

export { PARTY_COLS, ENEMY_COLS };
