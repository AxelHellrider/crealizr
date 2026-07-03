"use client";

import type { HazardSource } from "@/app/types/encounterLayout";

export type ArmedTool = { kind: "hazard"; source: HazardSource } | { kind: "cover" } | null;

interface GridToolbarProps {
    armed: ArmedTool;
    onArm: (tool: ArmedTool) => void;
}

function toolsEqual(a: ArmedTool, b: ArmedTool): boolean {
    if (a === null || b === null) return a === b;
    if (a.kind !== b.kind) return false;
    if (a.kind === "hazard" && b.kind === "hazard") return a.source === b.source;
    return true;
}

export function GridToolbar({ armed, onArm }: GridToolbarProps) {
    const items: { tool: ArmedTool; label: string }[] = [
        { tool: { kind: "hazard", source: "environment" }, label: "Environment Hazard" },
        { tool: { kind: "hazard", source: "spell" }, label: "Spell Hazard" },
        { tool: { kind: "cover" }, label: "Cover" },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {items.map(({ tool, label }) => {
                const active = toolsEqual(armed, tool);
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onArm(active ? null : tool)}
                        className={`min-h-9 sm:min-h-0 text-[11px] sm:text-[10px] uppercase tracking-widest px-2.5 sm:px-2 py-2 sm:py-1 rounded-sm border transition-colors ${
                            active
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-gold/15 text-muted hover:text-gold hover:border-gold/40"
                        }`}
                        aria-pressed={active}
                    >
                        + {label}
                    </button>
                );
            })}
            {armed && (
                <span className="text-[9px] text-muted/60 italic ml-1">Tap an empty hex to place</span>
            )}
        </div>
    );
}
