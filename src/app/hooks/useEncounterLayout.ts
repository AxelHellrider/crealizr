"use client";

import { useEffect, useReducer, useRef } from "react";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import type { EncounterNode, EnemyNode, PartyNode, GridCoord, ManualNode, NodeKind, HazardNode, CoverNode, CoverLevel } from "@/app/types/encounterLayout";

type Mode = "solo" | "group";
export type Orientation = "h" | "v";

const STORAGE_KEY = "crealizr.encounterLayout.v1";
const MAX_SEARCH_ROWS = 1000;

type State = {
    nodes: EncounterNode[];
    orientation: Orientation;
    removedEnemyCount: number;
    suggestionRef: GroupSuggestion | BossMinionSuggestion | null;
};

type EditablePatch = { label?: string; notes?: string; coverLevel?: CoverLevel; aoeRadius?: number };

type Action =
    | { type: "SET_FROM_SUGGESTION"; partySize: number; suggestion: GroupSuggestion | BossMinionSuggestion | null; mode: Mode; orientation: Orientation }
    | { type: "MOVE_NODE"; id: string; coord: GridCoord }
    | { type: "ADD_NODE"; node: ManualNode }
    | { type: "UPDATE_NODE"; id: string; patch: EditablePatch }
    | { type: "REMOVE_NODE"; id: string }
    | { type: "CLEAR_MANUAL_NODES" }
    | { type: "HYDRATE"; nodes: EncounterNode[] };

function newId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `n-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Horizontal: party fills cols 0-1, enemy fills cols 6-7, rows grow downward.
// Vertical:   party fills top rows (0+) across cols 0-3, enemy fills rows 5+ across cols 0-3.
function slotCoordAuto(orientation: Orientation, zone: "party" | "enemy", index: number): GridCoord {
    if (orientation === "h") {
        const cols: [number, number] = zone === "party" ? [0, 1] : [6, 7];
        return { col: cols[index % 2], row: Math.floor(index / 2) };
    }
    const startRow = zone === "party" ? 0 : 5;
    return { col: index % 4, row: startRow + Math.floor(index / 4) };
}

// Hazards only conflict with other hazards; all other kinds conflict only with other non-hazards.
function isOccupied(nodes: EncounterNode[], coord: GridCoord, excludeId?: string, kind?: NodeKind): boolean {
    return nodes.some((n) => {
        if (n.id === excludeId || n.coord.col !== coord.col || n.coord.row !== coord.row) return false;
        if (kind === "hazard") return n.kind === "hazard";
        return n.kind !== "hazard";
    });
}

function firstFreeCoord(nodes: EncounterNode[], orientation: Orientation, kind: "hazard" | "cover"): GridCoord {
    if (orientation === "h") {
        for (let row = 0; row < MAX_SEARCH_ROWS; row++)
            for (let col = 2; col <= 5; col++) {
                const coord = { col, row };
                if (!isOccupied(nodes, coord, undefined, kind)) return coord;
            }
    } else {
        for (let row = 2; row <= 4; row++)
            for (let col = 0; col < 4; col++) {
                const coord = { col, row };
                if (!isOccupied(nodes, coord, undefined, kind)) return coord;
            }
    }
    return { col: 2, row: 2 };
}

function regenerateAutoNodes(
    existing: EncounterNode[],
    prevOrientation: Orientation,
    nextOrientation: Orientation,
    partySize: number,
    suggestion: GroupSuggestion | BossMinionSuggestion | null,
    mode: Mode,
    removedEnemyCount: number,
): EncounterNode[] {
    const orientationChanged = prevOrientation !== nextOrientation;
    const manualNodes = existing.filter((n): n is ManualNode => n.kind === "hazard" || n.kind === "cover");
    const prevParty = existing.filter((n): n is PartyNode => n.kind === "party");
    const prevEnemy = existing.filter((n): n is EnemyNode => n.kind === "enemy");

    const partyNodes: PartyNode[] = Array.from({ length: Math.min(partySize, 8) }, (_, i) => {
        const prev = prevParty[i];
        const coord = (prev && !orientationChanged) ? prev.coord : slotCoordAuto(nextOrientation, "party", i);
        return prev ? { ...prev, coord } : { id: newId(), kind: "party", coord };
    });

    const allEnemyUnits: { cr: number; isBoss: boolean }[] = [];
    if (suggestion) {
        if (mode === "solo") {
            const s = suggestion as BossMinionSuggestion;
            for (let i = 0; i < s.boss.count; i++) allEnemyUnits.push({ cr: s.boss.cr, isBoss: true });
            for (const m of s.minions) for (let i = 0; i < m.count; i++) allEnemyUnits.push({ cr: m.cr, isBoss: false });
        } else {
            const s = suggestion as GroupSuggestion;
            for (const m of s.members) for (let i = 0; i < m.count; i++) allEnemyUnits.push({ cr: m.cr, isBoss: false });
        }
    }

    // Respect manually-removed enemies (trim from the end of the list)
    const enemyUnits = allEnemyUnits.slice(0, Math.max(0, allEnemyUnits.length - removedEnemyCount));

    const enemyNodes: EnemyNode[] = enemyUnits.map((unit, i) => {
        const prev = prevEnemy[i];
        const coord = (prev && !orientationChanged) ? prev.coord : slotCoordAuto(nextOrientation, "enemy", i);
        return prev
            ? { ...prev, coord, cr: unit.cr, isBoss: unit.isBoss }
            : { id: newId(), kind: "enemy", coord, cr: unit.cr, isBoss: unit.isBoss };
    });

    return [...partyNodes, ...enemyNodes, ...manualNodes];
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_FROM_SUGGESTION": {
            const suggestionChanged = action.suggestion !== state.suggestionRef;
            const removedEnemyCount = suggestionChanged ? 0 : state.removedEnemyCount;
            return {
                orientation: action.orientation,
                removedEnemyCount,
                suggestionRef: action.suggestion,
                nodes: regenerateAutoNodes(
                    state.nodes, state.orientation, action.orientation,
                    action.partySize, action.suggestion, action.mode,
                    removedEnemyCount,
                ),
            };
        }
        case "MOVE_NODE": {
            const moving = state.nodes.find((n) => n.id === action.id);
            if (!moving || isOccupied(state.nodes, action.coord, action.id, moving.kind)) return state;
            return { ...state, nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, coord: action.coord } : n)) };
        }
        case "ADD_NODE":
            return { ...state, nodes: [...state.nodes, action.node] };
        case "UPDATE_NODE":
            return {
                ...state,
                nodes: state.nodes.map((n) => (n.id === action.id ? ({ ...n, ...action.patch } as EncounterNode) : n)),
            };
        case "REMOVE_NODE": {
            const target = state.nodes.find((n) => n.id === action.id);
            return {
                ...state,
                removedEnemyCount: target?.kind === "enemy"
                    ? state.removedEnemyCount + 1
                    : state.removedEnemyCount,
                nodes: state.nodes.filter((n) => n.id !== action.id),
            };
        }
        case "CLEAR_MANUAL_NODES":
            return { ...state, nodes: state.nodes.filter((n) => n.kind !== "hazard" && n.kind !== "cover") };
        case "HYDRATE":
            return {
                ...state,
                // Migrate old stored hazard nodes that predate aoeRadius
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodes: action.nodes.map(n => (n.kind === "hazard" && (n as any).aoeRadius === undefined) ? { ...n, aoeRadius: 1 } : n),
            };
        default:
            return state;
    }
}

export function useEncounterLayout(
    partySize: number,
    suggestion: GroupSuggestion | BossMinionSuggestion | null,
    mode: Mode,
    orientation: Orientation,
) {
    const [state, dispatch] = useReducer(reducer, {
        nodes: [],
        orientation,
        removedEnemyCount: 0,
        suggestionRef: null,
    });
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
        dispatch({ type: "SET_FROM_SUGGESTION", partySize, suggestion, mode, orientation });
    }, [partySize, suggestion, mode, orientation]);

    useEffect(() => {
        const id = setTimeout(() => {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.nodes));
            } catch {
                // storage unavailable — silently skip persistence
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
            coord: coord ?? firstFreeCoord(state.nodes, orientation, kind),
            ...extra,
        } as ManualNode;
        dispatch({ type: "ADD_NODE", node });
        return node;
    }

    return {
        nodes: state.nodes,
        moveNode: (id: string, coord: GridCoord) => dispatch({ type: "MOVE_NODE", id, coord }),
        addNode,
        updateNode: (id: string, patch: EditablePatch) => dispatch({ type: "UPDATE_NODE", id, patch }),
        removeNode: (id: string) => dispatch({ type: "REMOVE_NODE", id }),
        clearManualNodes: () => dispatch({ type: "CLEAR_MANUAL_NODES" }),
        isOccupied: (coord: GridCoord, excludeId?: string, kind?: NodeKind) => isOccupied(state.nodes, coord, excludeId, kind),
    };
}
