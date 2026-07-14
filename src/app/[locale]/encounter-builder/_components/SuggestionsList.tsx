"use client";

import type { GroupSuggestion, BossMinionSuggestion, EncounterMode } from "@/engine/encounter";
import { Card } from "@/app/components/atoms/Card";
import { BudgetBar } from "./BudgetBar";
import { formatCR } from "@/app/lib/format";

type BudgetStatus = { label: string; color: string };

interface SuggestionsListProps {
    suggestions: (GroupSuggestion | BossMinionSuggestion)[];
    mode: EncounterMode;
    selectedIdx: number | null;
    useXP: boolean;
    budgetStatus: (fit: number) => BudgetStatus;
    onSelect: (index: number) => void;
    onExpand: (index: number) => void;
}

/** Selectable list of encounter suggestion cards, with a budget-fit bar and a "check monsters" expand action. */
export function SuggestionsList({ suggestions, mode, selectedIdx, useXP, budgetStatus, onSelect, onExpand }: SuggestionsListProps) {
    return (
        <ul className="flex flex-col gap-2">
            {suggestions.map((suggestion, i) => {
                const members = mode === "solo"
                    ? [
                        { cr: (suggestion as BossMinionSuggestion).boss.cr, count: (suggestion as BossMinionSuggestion).boss.count, label: "Boss" },
                        ...(suggestion as BossMinionSuggestion).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
                      ]
                    : (suggestion as GroupSuggestion).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

                const isSelected = selectedIdx === i;

                return (
                    <li key={i} data-testid="suggestion-card">
                        <Card
                            className={`border transition-all duration-150 cursor-pointer relative ${
                                isSelected
                                    ? ""
                                    : (mode === "solo" ? "border-gold/10 bg-background/50" : "border-silver/10 bg-background/50")
                            }`}
                            style={isSelected ? {
                                borderColor: "var(--accent-tertiary)",
                                boxShadow: "0 0 0 1px var(--accent-tertiary)",
                                backgroundColor: "color-mix(in srgb, var(--accent-tertiary) 6%, var(--surface-card))",
                            } : undefined}
                            onClick={() => onSelect(i)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(i); }}
                        >
                            {isSelected && (
                                <span className="absolute -top-2 left-3 z-10 bg-crimson text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                                    Active
                                </span>
                            )}
                            <div className="p-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex flex-wrap items-baseline gap-x-1 flex-1">
                                        {members.map((m, idx) => (
                                            <span key={idx}>
                                                <span className="font-bold text-base accent-gold">{m.count}</span>
                                                <span className="text-muted mx-1 font-sans italic text-sm">&times;</span>
                                                <span className="text-foreground text-sm">CR {formatCR(m.cr)}</span>
                                                {m.label && <span className="text-muted text-[10px] ml-0.5">({m.label})</span>}
                                                {idx < members.length - 1 && <span className="text-gold/30 mx-1.5">|</span>}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1.5">
                                        {useXP && (
                                            <span className="text-muted text-[10px] font-bold uppercase">
                                                {suggestion.adjustedXP.toLocaleString()} XP
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onExpand(i); }}
                                            className="text-[10px] text-background font-bold uppercase tracking-widest px-2 py-1 bg-gold/70 hover:bg-gold transition-colors rounded-sm"
                                            aria-label="View monster options"
                                        >
                                            Check Monsters
                                        </button>
                                    </div>
                                </div>
                                {useXP && (
                                    <div className={`mt-0.5 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(suggestion.fit).color}`}>
                                        {budgetStatus(suggestion.fit).label} · {(suggestion.fit * 100).toFixed(0)}%
                                    </div>
                                )}
                                <BudgetBar fit={suggestion.fit} accent={mode === "solo" ? "gold" : "silver"} />
                            </div>
                        </Card>
                    </li>
                );
            })}
        </ul>
    );
}
