"use client";

import { useEffect, useReducer, useRef } from "react";
import type { GroupSuggestion, BossMinionSuggestion } from "@/engine/encounter";
import {
    layoutReducer,
    initialLayoutState,
    firstFreeCoord,
    isOccupied as isOccupiedNodes,
    type Orientation,
    type EditablePatch,
} from "@/engine/encounter";
import type { EncounterNode, GridCoord, NodeKind, HazardNode, CoverNode } from "@/app/types/encounterLayout";
import { newId } from "@/app/lib/id";

export type { Orientation };

type Mode = "solo" | "group";

const STORAGE_KEY = "crealizr.encounterLayout.v1";

export function useEncounterLayout(
    partySize: number,
    suggestion: GroupSuggestion | BossMinionSuggestion | null,
    mode: Mode,
    orientation: Orientation,
) {
    const [state, dispatch] = useReducer(layoutReducer, orientation, initialLayoutState);
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
    ) {
        const node = {
            id: newId(),
            kind,
            coord: coord ?? firstFreeCoord(state.nodes, orientation, kind),
            ...extra,
        } as HazardNode | CoverNode;
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
        isOccupied: (coord: GridCoord, excludeId?: string, kind?: NodeKind) => isOccupiedNodes(state.nodes, coord, excludeId, kind),
    };
}
