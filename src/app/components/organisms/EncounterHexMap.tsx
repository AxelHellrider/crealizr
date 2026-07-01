"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";

type Mode = "solo" | "group";

interface EnemyUnit {
    cr: number;
    isBoss: boolean;
}

interface EncounterHexMapProps {
    partySize: number;
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: Mode;
}

const R = 25;
const W = Math.sqrt(3) * R;   // ≈43.3
const ROW_H = R * 1.5;         // 37.5
const SX = R + 4;               // 29
const SY = R + 8;               // 33
const COLS = 8;
const VISIBLE_ROWS = 8;

const SVG_W = Math.round(SX + (COLS - 1) * W + W / 2 + R + 4);   // ≈384
const SVG_H = Math.round(SY + (VISIBLE_ROWS - 1) * ROW_H + R + 4); // ≈327
const DIV_X = SVG_W / 2;

function hexCenter(col: number, row: number): [number, number] {
    return [
        SX + col * W + (row % 2) * (W / 2),
        SY + row * ROW_H,
    ];
}

function hexPath(cx: number, cy: number, r: number): string {
    const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    });
    return `M ${pts.join(" L ")} Z`;
}

// Pre-computed background grid
const BG_POSITIONS: [number, number][] = [];
for (let row = 0; row < VISIBLE_ROWS; row++)
    for (let col = 0; col < COLS; col++)
        BG_POSITIONS.push(hexCenter(col, row));

// Party slots: cols 0-1, rows 0-3 (8 slots)
const PARTY_SLOTS: [number, number][] = Array.from({ length: 8 }, (_, i) =>
    hexCenter(i % 2, Math.floor(i / 2))
);

// Clip X: just before col 6 (enemy territory)
const ENEMY_CLIP_X = Math.round(SX + 5 * W - W / 4);

export function EncounterHexMap({ partySize, suggestion, mode }: EncounterHexMapProps) {
    const [panRow, setPanRow] = useState(0);

    useEffect(() => { setPanRow(0); }, [suggestion]);

    const allUnits = useMemo((): EnemyUnit[] => {
        if (!suggestion) return [];
        if (mode === "solo") {
            const s = suggestion as BossMinionSuggestion;
            const units: EnemyUnit[] = [];
            for (let i = 0; i < s.boss.count; i++) units.push({ cr: s.boss.cr, isBoss: true });
            for (const m of s.minions) for (let i = 0; i < m.count; i++) units.push({ cr: m.cr, isBoss: false });
            return units;
        }
        const s = suggestion as GroupSuggestion;
        const units: EnemyUnit[] = [];
        for (const m of s.members) for (let i = 0; i < m.count; i++) units.push({ cr: m.cr, isBoss: false });
        return units;
    }, [suggestion, mode]);

    const totalRows = Math.ceil(allUnits.length / 2);
    const canPanDown = totalRows - panRow > VISIBLE_ROWS;
    const canPanUp = panRow > 0;
    const showNav = canPanUp || canPanDown;
    const visibleStart = panRow * 2 + 1;
    const visibleEnd = Math.min((panRow + VISIBLE_ROWS) * 2, allUnits.length);

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-2">
            <div className="relative flex-1 min-h-0">
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    preserveAspectRatio="xMidYMid meet"
                    aria-label="Encounter formation map"
                    role="img"
                >
                    <defs>
                        <clipPath id="enemy-area">
                            <rect x={ENEMY_CLIP_X} y={0} width={SVG_W - ENEMY_CLIP_X} height={SVG_H} />
                        </clipPath>
                    </defs>

                    {/* Background hex grid */}
                    {BG_POSITIONS.map(([cx, cy], i) => (
                        <path
                            key={`bg-${i}`}
                            d={hexPath(cx, cy, R - 1)}
                            fill="transparent"
                            stroke="rgba(197,160,89,0.05)"
                            strokeWidth={1}
                        />
                    ))}

                    {/* Divider */}
                    <line
                        x1={DIV_X} y1={SY - R + 4}
                        x2={DIV_X} y2={SVG_H - 8}
                        stroke="rgba(197,160,89,0.09)"
                        strokeWidth={1}
                        strokeDasharray="3 7"
                    />

                    {/* Section labels */}
                    <text x={SX + 0.5 * W} y={14}
                        textAnchor="middle" fill="rgba(52,211,153,0.32)"
                        fontSize={7} fontFamily="serif" letterSpacing="2">
                        PARTY
                    </text>
                    <text x={SX + 6.5 * W} y={14}
                        textAnchor="middle" fill="rgba(197,160,89,0.32)"
                        fontSize={7} fontFamily="serif" letterSpacing="2">
                        ENCOUNTER
                    </text>

                    {/* Party hexes */}
                    <AnimatePresence>
                        {PARTY_SLOTS.slice(0, Math.min(partySize, 8)).map(([cx, cy], i) => (
                            <motion.g
                                key={`pc-${i}`}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ delay: i * 0.04, duration: 0.2 }}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                            >
                                <path
                                    d={hexPath(cx, cy, R - 2)}
                                    fill="rgba(52,211,153,0.08)"
                                    stroke="rgba(52,211,153,0.48)"
                                    strokeWidth={1.5}
                                />
                                <text x={cx} y={cy + 3.5}
                                    textAnchor="middle"
                                    fill="rgba(52,211,153,0.7)"
                                    fontSize={7} fontFamily="serif">PC</text>
                            </motion.g>
                        ))}
                    </AnimatePresence>

                    {/* Enemy hexes (clipped) */}
                    <g clipPath="url(#enemy-area)">
                        <AnimatePresence>
                            {allUnits.map((unit, i) => {
                                const col = 6 + (i % 2);
                                const row = Math.floor(i / 2) - panRow;
                                if (row < 0 || row >= VISIBLE_ROWS) return null;
                                const [cx, cy] = hexCenter(col, row);
                                return (
                                    <motion.g
                                        key={`en-${i}`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ delay: i * 0.025, duration: 0.2 }}
                                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                                    >
                                        <path
                                            d={hexPath(cx, cy, R - 2)}
                                            fill={unit.isBoss ? "rgba(220,38,38,0.11)" : "rgba(197,160,89,0.07)"}
                                            stroke={unit.isBoss ? "rgba(220,38,38,0.52)" : "rgba(197,160,89,0.38)"}
                                            strokeWidth={unit.isBoss ? 2 : 1.5}
                                        />
                                        <text x={cx} y={cy - 2}
                                            textAnchor="middle"
                                            fill={unit.isBoss ? "rgba(220,38,38,0.85)" : "rgba(197,160,89,0.8)"}
                                            fontSize={6.5} fontFamily="sans-serif" fontWeight="bold">
                                            {formatCR(unit.cr)}
                                        </text>
                                        {unit.isBoss && (
                                            <text x={cx} y={cy + 7.5}
                                                textAnchor="middle"
                                                fill="rgba(220,38,38,0.4)"
                                                fontSize={5.5} fontFamily="serif" letterSpacing="0.5">
                                                BOSS
                                            </text>
                                        )}
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>

                        {allUnits.length === 0 && (
                            <text
                                x={SX + 6.5 * W} y={SVG_H / 2}
                                textAnchor="middle"
                                fill="rgba(197,160,89,0.16)"
                                fontSize={10} fontFamily="serif">—</text>
                        )}
                    </g>
                </svg>
            </div>

            {/* Paging controls */}
            {showNav && (
                <div className="shrink-0 flex items-center justify-end gap-2 px-1 pb-0.5">
                    <span className="text-[9px] text-muted/50 uppercase tracking-widest">
                        {visibleStart}–{visibleEnd} / {allUnits.length} enemies
                    </span>
                    <button
                        type="button"
                        disabled={!canPanUp}
                        onClick={() => setPanRow((p) => Math.max(0, p - 1))}
                        className="disabled:opacity-20 hover:text-gold transition-colors text-muted text-base leading-none px-1"
                        aria-label="Scroll enemies up"
                    >↑</button>
                    <button
                        type="button"
                        disabled={!canPanDown}
                        onClick={() => setPanRow((p) => p + 1)}
                        className="disabled:opacity-20 hover:text-gold transition-colors text-muted text-base leading-none px-1"
                        aria-label="Scroll enemies down"
                    >↓</button>
                </div>
            )}
        </div>
    );
}
