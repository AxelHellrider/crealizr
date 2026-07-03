"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Group, Text, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEncounterLayout } from "@/app/hooks/useEncounterLayout";
import { GridToolbar, type ArmedTool } from "./GridToolbar";
import { NodeEditorPopover } from "./NodeEditorPopover";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import type { EncounterNode, GridCoord } from "@/app/types/encounterLayout";
import { formatCR } from "@/app/lib/format";

type Mode = "solo" | "group";

interface EncounterHexMapProps {
    partySize: number;
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: Mode;
}

const R = 25;
const W = Math.sqrt(3) * R;
const ROW_H = R * 1.5;
const SX = R + 4;
const SY = R + 8;
const COLS = 8;

function hexCenter(col: number, row: number): [number, number] {
    return [SX + col * W + (row % 2) * (W / 2), SY + row * ROW_H];
}

function hexPoints(r: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(r * Math.cos(a), r * Math.sin(a));
    }
    return pts;
}

const HEX_OUTLINE = hexPoints(R - 1);
const HEX_FILL = hexPoints(R - 2);

const GRID_W = Math.round(SX + (COLS - 1) * W + W / 2 + R + 4);
const CELL_BUFFER = 2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

function nearestCoord(x: number, y: number): GridCoord {
    let best: GridCoord = { col: 0, row: 0 };
    let bestDist = Infinity;
    const approxRow = Math.max(0, Math.round((y - SY) / ROW_H));
    const approxCol = Math.max(0, Math.round((x - SX) / W));
    for (let row = Math.max(0, approxRow - 1); row <= approxRow + 1; row++) {
        for (let col = Math.max(0, approxCol - 1); col <= approxCol + 1; col++) {
            const [cx, cy] = hexCenter(col, row);
            const d = (cx - x) ** 2 + (cy - y) ** 2;
            if (d < bestDist) { bestDist = d; best = { col, row }; }
        }
    }
    return best;
}

function nodeStyle(node: EncounterNode): { fill: string; stroke: string; strokeWidth: number; opacity: number } {
    switch (node.kind) {
        case "party":
            return { fill: "rgba(52,211,153,0.08)", stroke: "rgba(52,211,153,0.48)", strokeWidth: 1.5, opacity: 1 };
        case "enemy":
            return node.isBoss
                ? { fill: "rgba(220,38,38,0.11)", stroke: "rgba(220,38,38,0.52)", strokeWidth: 2, opacity: 1 }
                : { fill: "rgba(197,160,89,0.07)", stroke: "rgba(197,160,89,0.38)", strokeWidth: 1.5, opacity: 1 };
        case "hazard":
            return node.source === "spell"
                ? { fill: "rgba(168,85,247,0.14)", stroke: "rgba(168,85,247,0.55)", strokeWidth: 1.5, opacity: 1 }
                : { fill: "rgba(217,119,6,0.14)", stroke: "rgba(217,119,6,0.55)", strokeWidth: 1.5, opacity: 1 };
        case "cover": {
            const opacity = node.coverLevel === "full" ? 0.85 : node.coverLevel === "three-quarter" ? 0.6 : 0.35;
            return { fill: "rgba(59,130,246,0.14)", stroke: "rgba(59,130,246,0.55)", strokeWidth: 1.5, opacity };
        }
    }
}

function nodeLabel(node: EncounterNode): string {
    switch (node.kind) {
        case "party": return node.label || "PC";
        case "enemy": return formatCR(node.cr);
        case "hazard": return node.label || (node.source === "spell" ? "Spell" : "Hazard");
        case "cover": return node.label || "Cover";
    }
}

export function EncounterHexMap({ partySize, suggestion, mode }: EncounterHexMapProps) {
    const layout = useEncounterLayout(partySize, suggestion, mode);
    const [armed, setArmed] = useState<ArmedTool>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
    const [size, setSize] = useState({ width: 320, height: 320 });
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPinching, setIsPinching] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const pinchDistRef = useRef<number | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width: Math.max(width, 1), height: Math.max(height, 1) });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const baseScale = Math.min(size.width / GRID_W, 1);
    const scale = baseScale * zoom;
    const editingNode = editingId ? layout.nodes.find((n) => n.id === editingId) : undefined;

    const bgCells = useMemo(() => {
        const worldLeft = -stagePos.x / scale;
        const worldRight = (size.width - stagePos.x) / scale;
        const worldTop = -stagePos.y / scale;
        const worldBottom = (size.height - stagePos.y) / scale;
        const minCol = Math.max(0, Math.floor((worldLeft - SX) / W) - CELL_BUFFER);
        const maxCol = Math.ceil((worldRight - SX) / W) + CELL_BUFFER;
        const minRow = Math.max(0, Math.floor((worldTop - SY) / ROW_H) - CELL_BUFFER);
        const maxRow = Math.ceil((worldBottom - SY) / ROW_H) + CELL_BUFFER;

        const cells: { coord: GridCoord; cx: number; cy: number }[] = [];
        for (let row = minRow; row <= maxRow; row++)
            for (let col = minCol; col <= maxCol; col++) {
                const [cx, cy] = hexCenter(col, row);
                cells.push({ coord: { col, row }, cx, cy });
            }
        return cells;
    }, [stagePos.x, stagePos.y, scale, size.width, size.height]);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const factor = e.evt.deltaY > 0 ? 0.92 : 1.08;
        setZoom((z) => clamp(z * factor, MIN_ZOOM, MAX_ZOOM));
    };

    const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
        const touches = e.evt.touches;
        if (touches.length !== 2) { pinchDistRef.current = null; setIsPinching(false); return; }
        e.evt.preventDefault();
        setIsPinching(true);
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchDistRef.current !== null) {
            const factor = dist / pinchDistRef.current;
            setZoom((z) => clamp(z * factor, MIN_ZOOM, MAX_ZOOM));
        }
        pinchDistRef.current = dist;
    };

    const handleTouchEnd = () => { pinchDistRef.current = null; setIsPinching(false); };

    const popoverPosFromEvent = (e: KonvaEventObject<Event>): { x: number; y: number } | null => {
        const stage = e.target.getStage();
        const box = stage?.container().getBoundingClientRect();
        const pos = stage?.getPointerPosition();
        if (!box || !pos) return null;
        const POPOVER_W = 224;
        const POPOVER_H = 220;
        const margin = 8;
        const x = clamp(box.left + pos.x, margin, window.innerWidth - POPOVER_W - margin);
        const y = clamp(box.top + pos.y, margin, window.innerHeight - POPOVER_H - margin);
        return { x, y };
    };

    const handleBackgroundClick = (coord: GridCoord, e: KonvaEventObject<Event>) => {
        if (!armed || layout.isOccupied(coord)) return;
        const node =
            armed.kind === "hazard"
                ? layout.addNode("hazard", { source: armed.source }, coord)
                : layout.addNode("cover", { coverLevel: "half" }, coord);
        const pos = popoverPosFromEvent(e);
        if (pos) setPopoverPos(pos);
        setArmed(null);
        setEditingId(node.id);
    };

    const handleNodeClick = (node: EncounterNode, e: KonvaEventObject<Event>) => {
        const pos = popoverPosFromEvent(e);
        if (pos) setPopoverPos(pos);
        setEditingId(node.id);
    };

    const handleQuickRemove = (node: EncounterNode, e: KonvaEventObject<Event>) => {
        e.cancelBubble = true;
        if (editingId === node.id) { setEditingId(null); setPopoverPos(null); }
        layout.removeNode(node.id);
    };

    const handleDragEnd = (node: EncounterNode, e: KonvaEventObject<DragEvent>) => {
        const coord = nearestCoord(e.target.x(), e.target.y());
        if (layout.isOccupied(coord, node.id)) {
            const [cx, cy] = hexCenter(node.coord.col, node.coord.row);
            e.target.position({ x: cx, y: cy });
            return;
        }
        layout.moveNode(node.id, coord);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-2">
            <GridToolbar
                armed={armed}
                onArm={setArmed}
                canClearAll={layout.nodes.some((n) => n.kind === "hazard" || n.kind === "cover")}
                onClearAll={() => {
                    if (editingNode && (editingNode.kind === "hazard" || editingNode.kind === "cover")) {
                        setEditingId(null);
                        setPopoverPos(null);
                    }
                    layout.clearManualNodes();
                }}
            />

            <div
                ref={containerRef}
                className="relative flex-1 min-h-0 overflow-hidden rounded-sm border border-gold/10 bg-black/10 touch-none"
            >
                <Stage
                    width={size.width}
                    height={size.height}
                    scale={{ x: scale, y: scale }}
                    draggable={!isPinching}
                    dragBoundFunc={(pos) => ({ x: Math.min(pos.x, 0), y: Math.min(pos.y, 0) })}
                    onDragMove={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
                    onWheel={handleWheel}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <Layer>
                        {bgCells.map(({ coord, cx, cy }) => (
                            <Line
                                key={`bg-${coord.col}-${coord.row}`}
                                x={cx}
                                y={cy}
                                points={HEX_OUTLINE}
                                closed
                                fill="transparent"
                                stroke="rgba(197,160,89,0.05)"
                                strokeWidth={1}
                                onClick={(e) => handleBackgroundClick(coord, e)}
                                onTap={(e) => handleBackgroundClick(coord, e)}
                                listening={!!armed}
                            />
                        ))}

                        <Text x={SX} y={2} width={2 * W} align="center" text="PARTY" fontSize={7} fontFamily="serif" fill="rgba(52,211,153,0.32)" />
                        <Text x={SX + 6 * W} y={2} width={2 * W} align="center" text="ENCOUNTER" fontSize={7} fontFamily="serif" fill="rgba(197,160,89,0.32)" />

                        {layout.nodes.map((node) => {
                            const [cx, cy] = hexCenter(node.coord.col, node.coord.row);
                            const style = nodeStyle(node);
                            return (
                                <Group
                                    key={node.id}
                                    x={cx}
                                    y={cy}
                                    draggable
                                    opacity={style.opacity}
                                    onDragEnd={(e) => handleDragEnd(node, e)}
                                    onClick={(e) => handleNodeClick(node, e)}
                                    onTap={(e) => handleNodeClick(node, e)}
                                >
                                    <Line points={HEX_FILL} closed fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
                                    <Text
                                        text={nodeLabel(node)}
                                        fontSize={node.kind === "enemy" ? 6.5 : 6}
                                        fontFamily="sans-serif"
                                        fill={style.stroke}
                                        align="center"
                                        width={W}
                                        offsetX={W / 2}
                                        y={-4}
                                    />
                                    {node.kind === "enemy" && node.isBoss && (
                                        <Text text="BOSS" fontSize={5.5} fontFamily="serif" fill="rgba(220,38,38,0.4)" align="center" width={W} offsetX={W / 2} y={6} />
                                    )}
                                    <Group
                                        x={R * 0.62}
                                        y={-R * 0.62}
                                        onClick={(e) => handleQuickRemove(node, e)}
                                        onTap={(e) => handleQuickRemove(node, e)}
                                    >
                                        <Circle radius={6} fill="rgba(15,15,19,0.85)" stroke={style.stroke} strokeWidth={1} />
                                        <Text text="x" fontSize={8} fontFamily="sans-serif" fill={style.stroke} align="center" verticalAlign="middle" width={12} height={12} offsetX={6} offsetY={6} />
                                    </Group>
                                </Group>
                            );
                        })}
                    </Layer>
                </Stage>
            </div>

            {editingNode && popoverPos && (
                <NodeEditorPopover
                    node={editingNode}
                    x={popoverPos.x}
                    y={popoverPos.y}
                    onChange={(patch) => layout.updateNode(editingNode.id, patch)}
                    onRemove={() => { layout.removeNode(editingNode.id); setEditingId(null); setPopoverPos(null); }}
                    onClose={() => { setEditingId(null); setPopoverPos(null); }}
                />
            )}
        </div>
    );
}
