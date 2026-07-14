"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getMonstersForCR } from "@/engine/encounter";
import type { GroupSuggestion, BossMinionSuggestion, Ruleset } from "@/engine/encounter";
import type { EncounterMode } from "@/engine/encounter";
import type { Monster } from "@/app/types/monster";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { formatCR } from "@/app/lib/format";

interface EncounterModalProps {
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: EncounterMode;
    ruleset: Ruleset;
    catalog: readonly Monster[];
    filterMonsterPool: (monsters: Monster[]) => Monster[];
    hasActiveFilter: boolean;
    onClose: () => void;
}

/** Expanded view of a suggestion's per-CR available monster pool. */
export function EncounterModal({
    suggestion, mode, ruleset, catalog, filterMonsterPool, hasActiveFilter, onClose,
}: EncounterModalProps) {
    useEffect(() => {
        if (!suggestion) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [suggestion, onClose]);

    if (!suggestion) return null;

    const members = mode === "solo"
        ? [
            { cr: (suggestion as BossMinionSuggestion).boss.cr, count: (suggestion as BossMinionSuggestion).boss.count, label: "Boss" },
            ...(suggestion as BossMinionSuggestion).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
          ]
        : (suggestion as GroupSuggestion).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

    const uniqueCRs = [...new Set(members.map((m) => m.cr))];

    const modal = (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    key="panel"
                    className="relative z-10 w-full max-w-lg bg-card border border-gold/20 rounded-sm shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 24 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <div data-testid="encounter-modal" className="flex justify-between items-start gap-3 p-5 border-b border-gold/10">
                        <div className="flex flex-wrap items-baseline gap-x-1">
                            {members.map((m, idx) => (
                                <span key={idx}>
                                    <span className="font-bold text-xl accent-gold">{m.count}</span>
                                    <span className="text-muted mx-1 font-sans italic">&times;</span>
                                    <span className="text-foreground text-lg">CR {formatCR(m.cr)}</span>
                                    {m.label && <span className="text-muted text-xs ml-1">({m.label})</span>}
                                    {idx < members.length - 1 && <span className="text-gold/30 mx-2">|</span>}
                                </span>
                            ))}
                        </div>
                        <button type="button" onClick={onClose}
                            className="text-muted hover:text-foreground transition-colors text-lg leading-none shrink-0 mt-0.5"
                            aria-label="Close">✕</button>
                    </div>
                    <div className="p-5 grid gap-3 max-h-[60vh] overflow-y-auto">
                        {uniqueCRs.map((cr) => {
                            const allMonsters = getMonstersForCR(cr, ruleset, catalog);
                            const monsters = filterMonsterPool(allMonsters);
                            const slot = members.find((m) => m.cr === cr);
                            const filtered = hasActiveFilter && monsters.length < allMonsters.length;
                            return (
                                <div key={cr}>
                                    <SubLabel className="mb-1.5">
                                        CR {formatCR(cr)} {slot?.label ? `(${slot.label})` : ""}{" — "}
                                        {monsters.length} available
                                        {filtered && <span className="text-gold/40 ml-1">({allMonsters.length} total)</span>}
                                    </SubLabel>
                                    {monsters.length === 0 ? (
                                        <p className="text-muted text-xs italic">No monsters match the current filter at this CR.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {monsters.map((m) => (
                                                <span key={m.name}
                                                    className={`inline-flex items-center px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                                                        m.source === "homebrew"
                                                            ? "border-gold/30 bg-gold/10 text-gold"
                                                            : "border-gold/10 bg-gold/5 text-foreground"
                                                    }`}
                                                    title={`${m.name} — ${m.affiliation}${m.genus ? `, ${m.genus}` : ""}${m.terrain?.length ? ` · ${m.terrain.join(", ")}` : ""}`}>
                                                    {m.name}
                                                    {m.source === "homebrew" && <span className="ml-1 text-[9px] text-gold/60">★</span>}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
