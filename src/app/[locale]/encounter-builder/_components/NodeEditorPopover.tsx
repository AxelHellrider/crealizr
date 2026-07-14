"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import type { EncounterNode, CoverLevel, AoEShape, HexDirection } from "@/app/types/encounterLayout";
import type { ConditionId } from "@/app/data/conditions";
import { getConditions } from "@/app/data/conditions";
import { getHazardPresets } from "@/app/data/hazards";
import type { Ruleset } from "@/engine/encounter";
import { hexDirectionLabel } from "@/engine/encounter";
import { nodeTitle } from "@/app/utils/encounterNodeDisplay";

const AOE_SHAPES: { value: AoEShape; label: string }[] = [
    { value: "burst", label: "Sphere / Cube / Cylinder (radiates outward)" },
    { value: "cone",  label: "Cone (fans out in one direction)" },
    { value: "line",  label: "Line (extends in one direction)" },
];

const DIRECTIONS: HexDirection[] = [0, 1, 2, 3, 4, 5];
const DIRECTION_OPTIONS = DIRECTIONS.map(dir => ({ value: dir, label: hexDirectionLabel(dir) }));

const DRAWER_WIDTH = 288;

interface NodeEditorPopoverProps {
    node: EncounterNode;
    /** The battlefield canvas box (normal or fullscreen) this drawer docks to. */
    containerRect: { top: number; left: number; width: number; height: number };
    ruleset: Ruleset;
    onChange: (patch: { label?: string; notes?: string; coverLevel?: CoverLevel; aoeRadius?: number; aoeShape?: AoEShape; aoeDirection?: HexDirection; conditions?: ConditionId[] }) => void;
    onRemove: () => void;
    onClose: () => void;
}

export function NodeEditorPopover({ node, containerRect, ruleset, onChange, onRemove, onClose }: NodeEditorPopoverProps) {
    if (typeof document === "undefined") return null;

    const toggleCondition = (id: ConditionId, current: ConditionId[]) => {
        const next = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
        onChange({ conditions: next });
    };

    const width = Math.min(DRAWER_WIDTH, containerRect.width);

    return createPortal(
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
                className="fixed z-50 border-l border-gold/25 bg-card shadow-2xl p-3 flex flex-col gap-2 overflow-y-auto"
                style={{
                    top: containerRect.top,
                    left: containerRect.left + containerRect.width - width,
                    width,
                    height: containerRect.height,
                }}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gold/70 font-bold">
                        {nodeTitle(node)}
                    </span>
                    <button type="button" onClick={onClose} className="text-muted hover:text-foreground text-sm leading-none p-2 -m-2" aria-label="Close">✕</button>
                </div>

                <Input
                    placeholder="Label"
                    value={node.label ?? ""}
                    onChange={(e) => onChange({ label: e.target.value })}
                    aria-label="Node label"
                />

                {node.kind === "hazard" && (
                    <>
                        <Select
                            value=""
                            onChange={(e) => {
                                const preset = getHazardPresets(node.source).find(p => p.id === e.target.value);
                                if (preset) onChange({ label: preset.name, notes: preset.description, aoeRadius: preset.aoeRadius });
                            }}
                            aria-label="Hazard preset"
                        >
                            <option value="" disabled>Load from hazard table…</option>
                            {getHazardPresets(node.source).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Select>

                        <textarea
                            className="ui-input w-full text-xs min-h-16 bg-surface border-silver/30 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                            placeholder="Notes"
                            value={node.notes ?? ""}
                            onChange={(e) => onChange({ notes: e.target.value })}
                            aria-label="Hazard notes"
                        />
                        <Select
                            value={node.aoeRadius}
                            onChange={(e) => onChange({ aoeRadius: Number(e.target.value) })}
                            aria-label="AoE radius"
                        >
                            <option value={0}>No AoE (single hex)</option>
                            <option value={1}>{node.aoeShape === "line" ? "Length 1 (2 hexes)" : "Radius 1 (7 hexes)"}</option>
                            <option value={2}>{node.aoeShape === "line" ? "Length 2 (3 hexes)" : "Radius 2 (19 hexes)"}</option>
                            <option value={3}>{node.aoeShape === "line" ? "Length 3 (4 hexes)" : "Radius 3 (37 hexes)"}</option>
                        </Select>

                        {/* Directional shapes (Cone/Line) only make sense for spells — environmental
                            hazards (pits, terrain, weather) are inherently area effects, not aimed. */}
                        {node.aoeRadius > 0 && node.source === "spell" && (
                            <Select
                                value={node.aoeShape ?? "burst"}
                                onChange={(e) => onChange({ aoeShape: e.target.value as AoEShape })}
                                aria-label="AoE shape"
                            >
                                {AOE_SHAPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Select>
                        )}

                        {node.aoeRadius > 0 && node.source === "spell" && (node.aoeShape === "cone" || node.aoeShape === "line") && (
                            <Select
                                value={node.aoeDirection ?? 0}
                                onChange={(e) => onChange({ aoeDirection: Number(e.target.value) as HexDirection })}
                                aria-label="AoE direction"
                            >
                                {DIRECTION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </Select>
                        )}
                    </>
                )}

                {node.kind === "cover" && (
                    <Select
                        value={node.coverLevel}
                        onChange={(e) => onChange({ coverLevel: e.target.value as CoverLevel })}
                        aria-label="Cover level"
                    >
                        <option value="half">Half Cover (+2 AC &amp; Dex saves)</option>
                        <option value="three-quarter">Three-Quarters Cover (+5 AC &amp; Dex saves)</option>
                        <option value="full">Full Cover (can&apos;t be targeted)</option>
                    </Select>
                )}

                {(node.kind === "party" || node.kind === "enemy") && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">Conditions</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {getConditions(ruleset).map(c => {
                                const active = (node.conditions ?? []).includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        title={c.description}
                                        onClick={() => toggleCondition(c.id, node.conditions ?? [])}
                                        aria-pressed={active}
                                        className={`text-left text-[10px] uppercase tracking-wide px-1.5 py-1 rounded-sm border transition-colors truncate ${
                                            active
                                                ? "border-gold bg-gold/15 text-gold"
                                                : "border-gold/15 text-muted hover:text-gold hover:border-gold/40"
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    className="text-[10px] uppercase tracking-widest text-crimson/80 hover:text-crimson transition-colors self-start mt-1 py-1.5 -my-1"
                >
                    Remove from grid
                </button>
            </motion.div>
        </>,
        document.body,
    );
}
