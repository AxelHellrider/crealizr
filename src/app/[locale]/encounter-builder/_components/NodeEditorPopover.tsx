"use client";

import { createPortal } from "react-dom";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { formatCR } from "@/app/lib/format";
import type { EncounterNode, CoverLevel } from "@/app/types/encounterLayout";

interface NodeEditorPopoverProps {
    node: EncounterNode;
    x: number;
    y: number;
    onChange: (patch: { label?: string; notes?: string; coverLevel?: CoverLevel }) => void;
    onRemove: () => void;
    onClose: () => void;
}

function nodeTitle(node: EncounterNode): string {
    switch (node.kind) {
        case "party": return "Party member";
        case "enemy": return `${node.isBoss ? "Boss" : "Enemy"} · CR ${formatCR(node.cr)}`;
        case "hazard": return `${node.source} hazard`;
        case "cover": return "cover";
    }
}

export function NodeEditorPopover({ node, x, y, onChange, onRemove, onClose }: NodeEditorPopoverProps) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                className="fixed z-50 w-56 rounded-sm border border-gold/25 bg-card shadow-2xl p-3 flex flex-col gap-2
                    max-sm:!left-1/2 max-sm:!top-1/2 max-sm:!-translate-x-1/2 max-sm:!-translate-y-1/2"
                style={{ left: x, top: y }}
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
                    <textarea
                        className="ui-input w-full text-xs min-h-16 bg-surface border-silver/30 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                        placeholder="Notes"
                        value={node.notes ?? ""}
                        onChange={(e) => onChange({ notes: e.target.value })}
                        aria-label="Hazard notes"
                    />
                )}

                {node.kind === "cover" && (
                    <Select
                        value={node.coverLevel}
                        onChange={(e) => onChange({ coverLevel: e.target.value as CoverLevel })}
                        aria-label="Cover level"
                    >
                        <option value="half">Half cover</option>
                        <option value="three-quarter">Three-quarter cover</option>
                        <option value="full">Full cover</option>
                    </Select>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    className="text-[10px] uppercase tracking-widest text-crimson/80 hover:text-crimson transition-colors self-start mt-1 py-1.5 -my-1"
                >
                    Remove from grid
                </button>
            </div>
        </>,
        document.body,
    );
}
