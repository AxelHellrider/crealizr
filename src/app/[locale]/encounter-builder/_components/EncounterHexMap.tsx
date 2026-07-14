"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Stage, Layer, Line, Group, Text, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEncounterLayout } from "@/app/hooks/useEncounterLayout";
import { useMapFullscreen } from "@/app/context/MapFullscreenContext";
import { MapToolbar } from "./MapToolbar";
import { NodeEditorPopover } from "./NodeEditorPopover";
import { MarqueeBox, type Marquee } from "./MarqueeBox";
import { RotateHintBanner, ROTATE_HINT_KEY } from "./RotateHintBanner";
import { AdvantagesPanel } from "@/app/components/molecules/AdvantagesPanel";
import type { GroupSuggestion, BossMinionSuggestion, Ruleset, EncounterMode } from "@/engine/encounter";
import {
    R, W, ROW_H, SX, SY, HORIZ_GRID_W, VERT_GRID_W, CELL_BUFFER, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP,
    HEX_OUTLINE, HEX_FILL, HEX_SELECT, HEX_AOE,
    hexCenter, hexDistance, nearestCoord,
} from "@/engine/encounter";
import type {
    EncounterNode, GridCoord, HazardNode, HazardSource, CoverNode, PartyNode, EnemyNode, CoverLevel, CoverBenefit, HazardEffect,
    MapMode,
} from "@/app/types/encounterLayout";
import { conditionAbbrs, toArmedTool, nodeStyle, nodeLabel, nodeSettingsSummary, hazardAoEHexes } from "@/app/utils/encounterNodeDisplay";
import { clamp } from "@/app/lib/number";

interface EncounterHexMapProps {
    partySize: number;
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: EncounterMode;
    ruleset: Ruleset;
    onPartyChange?: (newSize: number) => void;
    onCoverBenefits?: (benefits: CoverBenefit[]) => void;
    onHazardEffects?: (effects: HazardEffect[]) => void;
}

// ── Main component ───────────────────────────────────────────────────────────
export function EncounterHexMap({ partySize, suggestion, mode, ruleset, onPartyChange, onCoverBenefits, onHazardEffects }: EncounterHexMapProps) {
    const t = useTranslations("encounterBuilder");

    const [size, setSize]               = useState({ width: 320, height: 320 });
    const [mapMode, setMapMode]         = useState<MapMode>("select");
    const [cameraLocked, setCameraLocked] = useState(false);
    // Shared with the rest of the app (e.g. the PWA install badge hides itself while this is true).
    const { isFullscreen, setIsFullscreen } = useMapFullscreen();
    const [showRotateHint, setShowRotateHint] = useState(false);

    // Fixed vertical layout regardless of device/viewport — the battlefield
    // shouldn't reflow between mobile and desktop.
    const orientation = "v" as const;
    const layout      = useEncounterLayout(partySize, suggestion, mode, orientation);

    const [editingId,  setEditingId]  = useState<string | null>(null);
    const [popoverRect, setPopoverRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [stagePos,   setStagePos]   = useState({ x: 0, y: 0 });
    const [zoom,       setZoom]       = useState(1);
    const [isPinching, setIsPinching] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const shouldCenterRef = useRef(true);
    const pinchDistRef    = useRef<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeGroupRefs   = useRef<Map<string, any>>(new Map());
    const dragOriginRef   = useRef<{ x: number; y: number } | null>(null);
    const dragStartPos    = useRef<Map<string, { x: number; y: number }>>(new Map());
    const isDraggingMulti = useRef(false);
    const resizeObserver  = useRef<ResizeObserver | null>(null);

    // Marquee (rubber-band) multiselect — drag with Shift held over empty canvas.
    const [marquee, setMarquee] = useState<Marquee | null>(null);

    // Hover tooltip — desktop-only affordance to preview a node's current settings without opening the editor.
    const [hoveredNode, setHoveredNode] = useState<{ node: EncounterNode; x: number; y: number } | null>(null);
    const marqueeActive    = useRef(false);
    const justMarqueedRef  = useRef(false);

    // Kept fresh via effects so the mount-only keydown handler can read current values.
    const selectedIdsRef   = useRef(selectedIds);
    const nodesRef         = useRef(layout.nodes);
    const editingIdRef     = useRef(editingId);
    const onPartyChangeRef = useRef(onPartyChange);
    useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
    useEffect(() => { nodesRef.current = layout.nodes; }, [layout.nodes]);
    useEffect(() => { editingIdRef.current = editingId; }, [editingId]);
    useEffect(() => { onPartyChangeRef.current = onPartyChange; }, [onPartyChange]);

    // Callback ref — properly tears down / re-attaches ResizeObserver as the
    // normal container mounts/unmounts (e.g. when entering fullscreen).
    const normalContainerRef = useCallback((el: HTMLDivElement | null) => {
        resizeObserver.current?.disconnect();
        resizeObserver.current = null;
        if (!el) return;
        resizeObserver.current = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width: Math.max(width, 1), height: Math.max(height, 1) });
        });
        resizeObserver.current.observe(el);
    }, []);

    // Fullscreen uses window dimensions instead of the container div.
    useEffect(() => {
        if (!isFullscreen) return;
        const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [isFullscreen]);

    // Prevent body scroll while fullscreen is open.
    useEffect(() => {
        document.body.style.overflow = isFullscreen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isFullscreen]);

    // Suggest rotating to landscape on mobile portrait, once per fullscreen
    // entry — unless the user has already dismissed it for good.
    useEffect(() => {
        if (!isFullscreen) { setShowRotateHint(false); return; }
        const dismissed = window.localStorage.getItem(ROTATE_HINT_KEY) === "1";
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        setShowRotateHint(!dismissed && isMobile && isPortrait);
    }, [isFullscreen]);

    const dismissRotateHint = useCallback(() => {
        setShowRotateHint(false);
        try { window.localStorage.setItem(ROTATE_HINT_KEY, "1"); } catch { /* ignore */ }
    }, []);

    // Request re-centering whenever the encounter or viewport context changes.
    useEffect(() => { shouldCenterRef.current = true; }, [suggestion, partySize, isFullscreen]);

    // Full view reset: mode, camera lock, zoom, and re-centered pan.
    // (Previously "Esc" only reset mode + camera lock — zoom/pan were left
    // untouched, so resetting while zoomed/panned away looked like it did nothing.)
    const resetView = useCallback(() => {
        setMapMode("select");
        setCameraLocked(false);
        setZoom(1);
        shouldCenterRef.current = true;
    }, []);

    // ── Keyboard shortcuts ───────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as Element;
            if (target.closest("input, textarea, select, [contenteditable]")) return;
            if (e.metaKey || e.ctrlKey) return;
            switch (e.key) {
                case "w": case "W": setMapMode("select"); break;
                case "a": case "A":
                    setMapMode(m => m === "place-hazard-env" ? "select" : "place-hazard-env");
                    break;
                case "s": case "S":
                    setMapMode(m => m === "place-hazard-spell" ? "select" : "place-hazard-spell");
                    break;
                case "c": case "C":
                    setMapMode(m => m === "place-cover" ? "select" : "place-cover");
                    break;
                case "l": case "L": setCameraLocked(v => !v); break;
                case "+": case "=": setZoom(z => clamp(z * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)); break;
                case "-": case "_": setZoom(z => clamp(z / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)); break;
                case "Escape":
                    resetView();
                    break;
                case "Delete": case "Backspace": {
                    const ids = selectedIdsRef.current;
                    if (ids.size === 0) break;
                    e.preventDefault();
                    let removedParty = 0;
                    for (const id of ids) {
                        const n = nodesRef.current.find(nd => nd.id === id);
                        if (n?.kind === "party") removedParty++;
                        nodeGroupRefs.current.delete(id);
                        layout.removeNode(id);
                    }
                    if (removedParty > 0) {
                        const count = nodesRef.current.filter(nd => nd.kind === "party").length;
                        onPartyChangeRef.current?.(Math.max(1, count - removedParty));
                    }
                    if (editingIdRef.current && ids.has(editingIdRef.current)) {
                        setEditingId(null);
                        setPopoverRect(null);
                    }
                    setSelectedIds(new Set());
                    break;
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [resetView]);

    // ── Derived values ───────────────────────────────────────────────────────
    const armed       = toArmedTool(mapMode);
    const gridW       = orientation === "v" ? VERT_GRID_W : HORIZ_GRID_W;
    const baseScale   = Math.min(size.width / gridW, orientation === "v" ? 1.5 : 1);
    const scale       = baseScale * zoom;
    const editingNode = editingId ? layout.nodes.find(n => n.id === editingId) : undefined;

    const zoomIn  = () => setZoom(z => clamp(z * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
    const zoomOut = () => setZoom(z => clamp(z / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));

    // ── Content centering ────────────────────────────────────────────────────
    useEffect(() => {
        if (!shouldCenterRef.current || size.width <= 1 || !layout.nodes.length) return;
        shouldCenterRef.current = false;
        const xs = layout.nodes.map(n => hexCenter(n.coord.col, n.coord.row)[0]);
        const ys = layout.nodes.map(n => hexCenter(n.coord.col, n.coord.row)[1]);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        setStagePos({ x: size.width / 2 - cx * scale, y: size.height / 2 - cy * scale });
    }, [layout.nodes, size, scale]);

    // ── Background cells (virtual infinite grid) ─────────────────────────────
    const bgCells = useMemo(() => {
        const worldLeft   = -stagePos.x / scale;
        const worldRight  = (size.width  - stagePos.x) / scale;
        const worldTop    = -stagePos.y / scale;
        const worldBottom = (size.height - stagePos.y) / scale;
        const minCol = Math.floor((worldLeft  - SX) / W) - CELL_BUFFER;
        const maxCol = Math.ceil( (worldRight  - SX) / W) + CELL_BUFFER;
        const minRow = Math.floor((worldTop    - SY) / ROW_H) - CELL_BUFFER;
        const maxRow = Math.ceil( (worldBottom - SY) / ROW_H) + CELL_BUFFER;
        const cells: { coord: GridCoord; cx: number; cy: number }[] = [];
        for (let row = minRow; row <= maxRow; row++)
            for (let col = minCol; col <= maxCol; col++) {
                const [cx, cy] = hexCenter(col, row);
                cells.push({ coord: { col, row }, cx, cy });
            }
        return cells;
    }, [stagePos.x, stagePos.y, scale, size.width, size.height]);

    // ── AoE derived data ─────────────────────────────────────────────────────
    // affectedHexes: coord key → hazard source (or "both")
    // protectedKeys: coord keys covered by a Cover node (blocks the hazard)
    const aoeData = useMemo(() => {
        const affectedHexes = new Map<string, HazardSource | "both">();
        const protectedKeys = new Set<string>();
        const coverKeys = new Set(
            layout.nodes.filter(n => n.kind === "cover").map(n => `${n.coord.col},${n.coord.row}`)
        );
        for (const n of layout.nodes) {
            if (n.kind !== "hazard" || (n as HazardNode).aoeRadius <= 0) continue;
            const hazard = n as HazardNode;
            for (const hex of hazardAoEHexes(hazard)) {
                const key = `${hex.col},${hex.row}`;
                if (coverKeys.has(key)) {
                    protectedKeys.add(key);
                } else {
                    const prev = affectedHexes.get(key);
                    affectedHexes.set(key, prev && prev !== hazard.source ? "both" : hazard.source);
                }
            }
        }
        return { affectedHexes, protectedKeys };
    }, [layout.nodes]);

    // ── Hazard effects on creatures currently standing in an AoE ─────────────
    const hazardEffects = useMemo<HazardEffect[]>(() => {
        const hazards = layout.nodes.filter((n): n is HazardNode => n.kind === "hazard" && n.aoeRadius >= 0);
        const creatures = layout.nodes.filter((n): n is PartyNode | EnemyNode => n.kind === "party" || n.kind === "enemy");
        const effects: HazardEffect[] = [];
        for (const creature of creatures) {
            const key = `${creature.coord.col},${creature.coord.row}`;
            if (aoeData.protectedKeys.has(key)) continue;
            for (const hazard of hazards) {
                if (!hazardAoEHexes(hazard).some(h => h.col === creature.coord.col && h.row === creature.coord.row)) continue;
                effects.push({
                    creatureLabel: nodeLabel(creature),
                    creatureKind: creature.kind,
                    hazardLabel: hazard.label || (hazard.source === "spell" ? "Spell hazard" : "Env. hazard"),
                    source: hazard.source,
                    notes: hazard.notes,
                });
            }
        }
        return effects;
    }, [layout.nodes, aoeData.protectedKeys]);

    useEffect(() => { onHazardEffects?.(hazardEffects); }, [hazardEffects, onHazardEffects]);

    // ── Cover benefits for adjacent party members ────────────────────────────
    const coverBenefits = useMemo<CoverBenefit[]>(() => {
        const coverNodes = layout.nodes.filter((n): n is CoverNode => n.kind === "cover");
        const partyNodes = layout.nodes.filter((n): n is PartyNode => n.kind === "party");
        const levelOrder: CoverLevel[] = ["half", "three-quarter", "full"];
        return partyNodes.flatMap(p => {
            const adjacent = coverNodes.filter(c => hexDistance(p.coord, c.coord) === 1);
            if (!adjacent.length) return [];
            const best = adjacent.reduce((b, c) =>
                levelOrder.indexOf(c.coverLevel) > levelOrder.indexOf(b.coverLevel) ? c : b
            , adjacent[0]);
            return [{ partyLabel: p.label || "PC", coverLevel: best.coverLevel }];
        });
    }, [layout.nodes]);

    useEffect(() => { onCoverBenefits?.(coverBenefits); }, [coverBenefits, onCoverBenefits]);

    // ── Event handlers ───────────────────────────────────────────────────────
    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        setZoom(z => clamp(z * (e.evt.deltaY > 0 ? 0.92 : 1.08), MIN_ZOOM, MAX_ZOOM));
    };

    const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
        const { touches } = e.evt;
        if (touches.length !== 2) { pinchDistRef.current = null; setIsPinching(false); return; }
        e.evt.preventDefault();
        setIsPinching(true);
        const dist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        if (pinchDistRef.current !== null) setZoom(z => clamp(z * dist / pinchDistRef.current!, MIN_ZOOM, MAX_ZOOM));
        pinchDistRef.current = dist;
    };

    const handleTouchEnd = () => { pinchDistRef.current = null; setIsPinching(false); };

    // The editor is a drawer docked to the canvas box itself (normal or
    // fullscreen) — not positioned near the click — so both the node and its
    // settings stay visible together, on every device.
    const popoverRectFromEvent = (e: KonvaEventObject<Event>): { top: number; left: number; width: number; height: number } | null => {
        const box = e.target.getStage()?.container().getBoundingClientRect();
        if (!box) return null;
        return { top: box.top, left: box.left, width: box.width, height: box.height };
    };

    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        if (justMarqueedRef.current) { justMarqueedRef.current = false; return; }
        if (e.target !== e.target.getStage()) return;
        setSelectedIds(new Set());
        setEditingId(null);
        setPopoverRect(null);
    };

    // ── Marquee (shift + drag) multiselect ───────────────────────────────────
    const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        if (e.target !== e.target.getStage() || !e.evt.shiftKey) return;
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();
        if (!stage || !pos) return;
        e.evt.preventDefault();
        stage.draggable(false);
        marqueeActive.current = true;
        setMarquee({ x0: pos.x, y0: pos.y, x1: pos.x, y1: pos.y });
    };

    const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (!marqueeActive.current) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        setMarquee(m => (m ? { ...m, x1: pos.x, y1: pos.y } : m));
    };

    const endMarquee = (e: KonvaEventObject<MouseEvent>) => {
        if (!marqueeActive.current) return;
        marqueeActive.current = false;
        const stage = e.target.getStage();
        stage?.draggable(!isPinching && !cameraLocked);

        setMarquee(current => {
            if (current) {
                const left   = Math.min(current.x0, current.x1);
                const right  = Math.max(current.x0, current.x1);
                const top    = Math.min(current.y0, current.y1);
                const bottom = Math.max(current.y0, current.y1);
                const wLeft   = (left   - stagePos.x) / scale;
                const wRight  = (right  - stagePos.x) / scale;
                const wTop    = (top    - stagePos.y) / scale;
                const wBottom = (bottom - stagePos.y) / scale;
                const hitIds = layout.nodes
                    .filter(n => {
                        const [cx, cy] = hexCenter(n.coord.col, n.coord.row);
                        return cx >= wLeft && cx <= wRight && cy >= wTop && cy <= wBottom;
                    })
                    .map(n => n.id);
                if (hitIds.length) {
                    justMarqueedRef.current = true;
                    setSelectedIds(prev => new Set([...prev, ...hitIds]));
                }
            }
            return null;
        });
    };

    const handleBackgroundClick = (coord: GridCoord, e: KonvaEventObject<Event>) => {
        if (!armed || layout.isOccupied(coord, undefined, armed.kind)) return;
        const node = armed.kind === "hazard"
            ? layout.addNode("hazard", { source: armed.source, aoeRadius: 1 }, coord)
            : layout.addNode("cover", { coverLevel: "half" }, coord);
        const rect = popoverRectFromEvent(e);
        if (rect) setPopoverRect(rect);
        setMapMode("select");
        setEditingId(node.id);
    };

    const handleNodeClick = (node: EncounterNode, e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                return next;
            });
            return;
        }
        if (selectedIds.size > 1 && selectedIds.has(node.id)) { setSelectedIds(new Set([node.id])); return; }
        setSelectedIds(new Set([node.id]));
        const rect = popoverRectFromEvent(e);
        if (rect) setPopoverRect(rect);
        setEditingId(node.id);
    };

    const handleNodeTap = (node: EncounterNode, e: KonvaEventObject<Event>) => {
        e.cancelBubble = true;
        setSelectedIds(new Set([node.id]));
        const rect = popoverRectFromEvent(e);
        if (rect) setPopoverRect(rect);
        setEditingId(node.id);
    };

    const handleQuickRemove = (node: EncounterNode, e: KonvaEventObject<Event>) => {
        e.cancelBubble = true;
        if (editingId === node.id) { setEditingId(null); setPopoverRect(null); }
        setSelectedIds(prev => { const s = new Set(prev); s.delete(node.id); return s; });
        nodeGroupRefs.current.delete(node.id);
        if (node.kind === "party") {
            const count = layout.nodes.filter(n => n.kind === "party").length;
            onPartyChange?.(Math.max(1, count - 1));
        }
        layout.removeNode(node.id);
    };

    const handleNodeHover = (node: EncounterNode, e: KonvaEventObject<MouseEvent>) => {
        setHoveredNode({ node, x: e.evt.clientX, y: e.evt.clientY });
    };
    const handleNodeUnhover = () => setHoveredNode(null);

    const handleDragStart = (node: EncounterNode, e: KonvaEventObject<DragEvent>) => {
        setHoveredNode(null);
        if (!selectedIds.has(node.id) || selectedIds.size < 2) return;
        isDraggingMulti.current = true;
        dragOriginRef.current = { x: e.target.x(), y: e.target.y() };
        dragStartPos.current.clear();
        for (const id of selectedIds) {
            const ref = nodeGroupRefs.current.get(id);
            if (ref) dragStartPos.current.set(id, ref.position());
        }
    };

    const handleDragMove = (node: EncounterNode, e: KonvaEventObject<DragEvent>) => {
        if (!isDraggingMulti.current || !dragOriginRef.current) return;
        const dx = e.target.x() - dragOriginRef.current.x;
        const dy = e.target.y() - dragOriginRef.current.y;
        for (const [id, start] of dragStartPos.current) {
            if (id !== node.id) nodeGroupRefs.current.get(id)?.position({ x: start.x + dx, y: start.y + dy });
        }
    };

    const handleDragEnd = (node: EncounterNode, e: KonvaEventObject<DragEvent>) => {
        if (isDraggingMulti.current && dragOriginRef.current) {
            isDraggingMulti.current = false;
            const dx = e.target.x() - dragOriginRef.current.x;
            const dy = e.target.y() - dragOriginRef.current.y;

            const draggedCoord = nearestCoord(e.target.x(), e.target.y());
            if (!layout.isOccupied(draggedCoord, node.id, node.kind)) layout.moveNode(node.id, draggedCoord);
            else { const [cx, cy] = hexCenter(node.coord.col, node.coord.row); nodeGroupRefs.current.get(node.id)?.position({ x: cx, y: cy }); }

            for (const [id, start] of dragStartPos.current) {
                if (id === node.id) continue;
                const peer = layout.nodes.find(n => n.id === id);
                if (!peer) continue;
                const coord = nearestCoord(start.x + dx, start.y + dy);
                if (!layout.isOccupied(coord, id, peer.kind)) layout.moveNode(id, coord);
                else { const [cx, cy] = hexCenter(peer.coord.col, peer.coord.row); nodeGroupRefs.current.get(id)?.position({ x: cx, y: cy }); }
            }
            dragOriginRef.current = null;
            dragStartPos.current.clear();
            return;
        }
        const coord = nearestCoord(e.target.x(), e.target.y());
        if (layout.isOccupied(coord, node.id, node.kind)) {
            const [cx, cy] = hexCenter(node.coord.col, node.coord.row);
            e.target.position({ x: cx, y: cy });
            return;
        }
        layout.moveNode(node.id, coord);
    };

    // ── Toolbar shared props ─────────────────────────────────────────────────
    const toolbarProps = {
        mode: mapMode,
        cameraLocked,
        onModeChange: setMapMode,
        onCameraLockToggle: () => setCameraLocked(v => !v),
        onZoomIn: zoomIn,
        onZoomOut: zoomOut,
        canClearAll: layout.nodes.some(n => n.kind === "hazard" || n.kind === "cover"),
        onClearAll: () => {
            if (editingNode && (editingNode.kind === "hazard" || editingNode.kind === "cover")) {
                setEditingId(null); setPopoverRect(null);
            }
            layout.clearManualNodes();
        },
    };

    // ── Konva Stage (shared JSX, rendered in ONE place) ──────────────────────
    const stageJSX = (
        <Stage
            width={size.width}
            height={size.height}
            x={stagePos.x}
            y={stagePos.y}
            scale={{ x: scale, y: scale }}
            draggable={!isPinching && !cameraLocked}
            onDragMove={e => { if (e.target === e.target.getStage()) setStagePos({ x: e.target.x(), y: e.target.y() }); }}
            onClick={handleStageClick}
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={endMarquee}
            onMouseLeave={endMarquee}
        >
            <Layer>
                {bgCells.map(({ coord, cx, cy }) => (
                    <Line
                        key={`bg-${coord.col}-${coord.row}`}
                        x={cx} y={cy}
                        points={HEX_OUTLINE}
                        closed fill="transparent"
                        stroke="rgba(197,160,89,0.05)" strokeWidth={1}
                        onClick={e => handleBackgroundClick(coord, e)}
                        onTap={e => handleBackgroundClick(coord, e)}
                        listening={!!armed}
                    />
                ))}

                {/* AoE hex fills — rendered between grid and nodes */}
                {(layout.nodes.filter(n => n.kind === "hazard") as HazardNode[])
                    .filter(h => h.aoeRadius > 0)
                    .flatMap(hazard =>
                        hazardAoEHexes(hazard).map(hex => {
                            const [cx, cy] = hexCenter(hex.col, hex.row);
                            const key = `${hex.col},${hex.row}`;
                            const isProtected = aoeData.protectedKeys.has(key);
                            const fill = isProtected
                                ? "rgba(59,130,246,0.18)"
                                : hazard.source === "spell"
                                    ? "rgba(168,85,247,0.18)"
                                    : "rgba(217,119,6,0.18)";
                            const stroke = isProtected
                                ? "rgba(59,130,246,0.35)"
                                : hazard.source === "spell"
                                    ? "rgba(168,85,247,0.30)"
                                    : "rgba(217,119,6,0.30)";
                            return (
                                <Line
                                    key={`aoe-${hazard.id}-${hex.col}-${hex.row}`}
                                    x={cx} y={cy}
                                    points={HEX_AOE}
                                    closed fill={fill} stroke={stroke} strokeWidth={1}
                                    listening={false}
                                />
                            );
                        })
                    )}

                {[...layout.nodes]
                    .sort((a, b) => (a.kind === "hazard" ? 1 : 0) - (b.kind === "hazard" ? 1 : 0))
                    .map(node => {
                        const [cx, cy] = hexCenter(node.coord.col, node.coord.row);
                        const style = nodeStyle(node);
                        return (
                            <Group
                                key={node.id}
                                ref={ref => { if (ref) nodeGroupRefs.current.set(node.id, ref); else nodeGroupRefs.current.delete(node.id); }}
                                x={cx} y={cy}
                                draggable
                                opacity={style.opacity}
                                onDragStart={e => handleDragStart(node, e)}
                                onDragMove={e => handleDragMove(node, e)}
                                onDragEnd={e => handleDragEnd(node, e)}
                                onClick={e => handleNodeClick(node, e)}
                                onTap={e => handleNodeTap(node, e)}
                                onMouseEnter={e => handleNodeHover(node, e)}
                                onMouseMove={e => handleNodeHover(node, e)}
                                onMouseLeave={handleNodeUnhover}
                            >
                                {selectedIds.has(node.id) && (
                                    <Line points={HEX_SELECT} closed fill="transparent" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                                )}
                                {(node.kind === "party" || node.kind === "enemy") && (() => {
                                    const src = aoeData.affectedHexes.get(`${node.coord.col},${node.coord.row}`);
                                    if (!src) return null;
                                    const glowColor = src === "spell"
                                        ? "rgba(168,85,247,0.55)"
                                        : src === "both"
                                            ? "rgba(200,100,247,0.55)"
                                            : "rgba(217,119,6,0.55)";
                                    return <Line points={HEX_SELECT} closed fill="transparent" stroke={glowColor} strokeWidth={2.5} listening={false} />;
                                })()}
                                <Line points={HEX_FILL} closed fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
                                <Text
                                    text={nodeLabel(node)}
                                    fontSize={6}
                                    fontFamily="sans-serif" fill={style.stroke}
                                    align="center" width={W} offsetX={W / 2} y={-4}
                                />
                                {/* Only needed when a custom label is set — otherwise nodeLabel() already reads "Boss" */}
                                {node.kind === "enemy" && node.isBoss && node.label && (
                                    <Text text="BOSS" fontSize={5.5} fontFamily="serif" fill="rgba(220,38,38,0.4)" align="center" width={W} offsetX={W / 2} y={6} />
                                )}
                                {(node.kind === "party" || node.kind === "enemy") && conditionAbbrs(node, ruleset) && (
                                    <Text
                                        text={conditionAbbrs(node, ruleset)}
                                        fontSize={4.5}
                                        fontFamily="sans-serif" fill="rgba(220,38,38,0.85)"
                                        align="center" width={W} offsetX={W / 2}
                                        y={node.kind === "enemy" && node.isBoss ? 12 : 6}
                                    />
                                )}
                                <Group
                                    x={R * 0.62} y={-R * 0.62}
                                    onClick={e => handleQuickRemove(node, e)}
                                    onTap={e => handleQuickRemove(node, e)}
                                >
                                    <Circle radius={6} fill="rgba(15,15,19,0.85)" stroke={style.stroke} strokeWidth={1} />
                                    <Text text="x" fontSize={8} fontFamily="sans-serif" fill={style.stroke} align="center" verticalAlign="middle" width={12} height={12} offsetX={6} offsetY={6} />
                                </Group>
                            </Group>
                        );
                    })}
            </Layer>
        </Stage>
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {hoveredNode && (
                <div
                    className="fixed z-[60] pointer-events-none border border-gold/25 bg-card px-2.5 py-1.5 text-[10px] text-foreground shadow-2xl max-w-56"
                    style={{ left: hoveredNode.x + 14, top: hoveredNode.y + 14 }}
                >
                    <div className="uppercase tracking-widest text-gold/70 font-bold mb-0.5">{nodeLabel(hoveredNode.node)}</div>
                    <div>{nodeSettingsSummary(hoveredNode.node, ruleset)}</div>
                </div>
            )}

            <div className="flex flex-col flex-1 min-h-0 gap-2">
                <MapToolbar {...toolbarProps} isFullscreen={false} onFullscreenToggle={() => setIsFullscreen(true)} />

                {/* Normal canvas — desktop only. On mobile the canvas only ever opens in fullscreen (below). */}
                {!isFullscreen && (
                    <div
                        ref={normalContainerRef}
                        className="relative flex-1 min-h-0 overflow-hidden rounded-sm border border-gold/10 bg-black/10 touch-none hidden sm:block"
                    >
                        {stageJSX}
                        {marquee && <MarqueeBox marquee={marquee} />}
                        {mapMode !== "select" && (
                            <div className="absolute bottom-2 left-2 pointer-events-none select-none text-[8px] text-muted/50 italic hidden sm:block">
                                Click empty hex to place
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile prompt — canvas doesn't render inline on small screens, only in fullscreen */}
                {!isFullscreen && (
                    <div className="flex-1 min-h-0 rounded-sm border border-gold/10 bg-black/10 flex flex-col items-center justify-center gap-4 p-6 sm:hidden">
                        <p className="text-xs text-muted text-center max-w-[220px]">{t("openBattlefieldHint")}</p>
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            className="ui-button min-h-11 px-5 text-xs uppercase tracking-widest"
                        >
                            {t("openBattlefield")}
                        </button>
                    </div>
                )}

                {/* Fullscreen placeholder — keeps the flex column height reserved */}
                {isFullscreen && (
                    <div className="flex-1 min-h-0 rounded-sm border border-gold/10 bg-black/10 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(false)}
                            className="text-xs text-muted/60 uppercase tracking-widest hover:text-gold transition-colors"
                        >
                            ← Return to battlefield
                        </button>
                    </div>
                )}

                {editingNode && popoverRect && (
                    <NodeEditorPopover
                        node={editingNode}
                        containerRect={popoverRect}
                        ruleset={ruleset}
                        onChange={patch => layout.updateNode(editingNode.id, patch)}
                        onRemove={() => { layout.removeNode(editingNode.id); setEditingId(null); setPopoverRect(null); }}
                        onClose={() => { setEditingId(null); setPopoverRect(null); }}
                    />
                )}
            </div>

            {/* ── Fullscreen portal ─────────────────────────────────────────── */}
            {isFullscreen && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-50 flex flex-col bg-background">
                    {/* Header */}
                    <div
                        className="shrink-0 flex items-center justify-between gap-4 px-4 h-10 border-b border-gold/10"
                        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(2.5rem + env(safe-area-inset-top))" }}
                    >
                        <span className="font-serif text-xs uppercase tracking-widest text-muted">Battlefield</span>
                        {mapMode !== "select" && (
                            <span className="text-[9px] text-muted/60 italic">Tap empty hex to place</span>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(false)}
                            className="ui-button shrink-0 ml-auto min-h-9 gap-1.5 px-3 text-[10px]"
                            aria-label="Close fullscreen"
                        >
                            <span aria-hidden="true">✕</span>
                            <span>Close</span>
                        </button>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 min-h-0 relative overflow-hidden touch-none">
                        {showRotateHint && <RotateHintBanner onDismiss={dismissRotateHint} />}
                        {stageJSX}
                        {marquee && <MarqueeBox marquee={marquee} />}
                    </div>

                    {/* Party advantages/disadvantages — otherwise only visible in the sidebar, which fullscreen hides */}
                    {(coverBenefits.length > 0 || hazardEffects.length > 0) && (
                        <div className="shrink-0 max-h-32 overflow-y-auto border-t border-gold/10 bg-card">
                            <AdvantagesPanel coverBenefits={coverBenefits} hazardEffects={hazardEffects} className="border-t-0 pt-0 max-w-xs mx-auto px-4 py-2" />
                        </div>
                    )}

                    {/* Bottom toolbar */}
                    <MapToolbar {...toolbarProps} isFullscreen={true} onFullscreenToggle={() => setIsFullscreen(false)} />
                </div>,
                document.body,
            )}
        </>
    );
}
