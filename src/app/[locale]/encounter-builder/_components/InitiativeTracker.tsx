"use client";

import { useState } from "react";
import { useCombat } from "@/app/context/CombatContext";
import { getConditions, type ConditionId } from "@/app/data/conditions";
import type { Combatant } from "@/app/types/combat";
import type { Ruleset } from "@/engine/encounter";

interface InitiativeTrackerProps {
    ruleset: Ruleset;
    className?: string;
}

/** Renders the active combat's turn order. The parent only mounts this once
 * combat has actually started (see EncounterHexMap's "Start Encounter"
 * action), so there's no empty/not-started state to render here. */
export function InitiativeTracker({ ruleset, className = "" }: InitiativeTrackerProps) {
    const combat = useCombat();
    const [deltaInputs, setDeltaInputs] = useState<Record<string, string>>({});

    if (!combat.combat) return null;

    const { turnOrder, activeCombatant, combat: state } = combat;

    const applyDelta = (combatant: Combatant, sign: 1 | -1) => {
        const raw = deltaInputs[combatant.id];
        const amount = raw ? Math.abs(Number(raw)) || 0 : 0;
        if (!amount || combatant.currentHP === null) return;
        const max = combatant.maxHP ?? Infinity;
        const next = Math.max(0, Math.min(max, combatant.currentHP + sign * amount));
        combat.updateCombatant(combatant.id, { currentHP: next });
        setDeltaInputs((prev) => ({ ...prev, [combatant.id]: "" }));
    };

    const toggleCondition = (combatant: Combatant, id: ConditionId) => {
        const next = combatant.conditions.includes(id)
            ? combatant.conditions.filter((c) => c !== id)
            : [...combatant.conditions, id];
        combat.updateCombatant(combatant.id, { conditions: next });
    };

    const setDeathSave = (combatant: Combatant, kind: "successes" | "failures", value: number) => {
        const saves = combatant.deathSaves ?? { successes: 0, failures: 0 };
        combat.updateCombatant(combatant.id, { deathSaves: { ...saves, [kind]: value } });
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {/* Round/turn controls */}
            <div className="flex items-center justify-between gap-2 shrink-0">
                <div className="text-[10px] uppercase tracking-widest text-gold/90 font-bold truncate">
                    Round {state.round}{activeCombatant ? ` · ${activeCombatant.name}'s turn` : ""}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={combat.prevTurn} className="ui-button min-h-7 px-2 text-[10px]" aria-label="Previous turn">←</button>
                    <button type="button" onClick={combat.nextTurn} className="ui-button min-h-7 px-2 text-[10px]" aria-label="Next turn">→</button>
                </div>
            </div>
            <button type="button" onClick={combat.rollAllInitiative} className="ui-button shrink-0 min-h-8 text-[10px] uppercase tracking-widest">
                Roll All Initiative
            </button>

            {/* Combatant list */}
            <div className="flex flex-col gap-2 overflow-y-auto min-h-0">
                {turnOrder.map((c) => {
                    const isActive = activeCombatant?.id === c.id;
                    const isDown = c.currentHP !== null && c.currentHP <= 0;
                    return (
                        <div
                            key={c.id}
                            className={`border p-2 flex flex-col gap-1.5 transition-colors ${
                                isActive ? "border-gold bg-gold/10" : "border-gold/10 bg-card/40"
                            }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <input
                                    value={c.name}
                                    onChange={(e) => combat.updateCombatant(c.id, { name: e.target.value })}
                                    className="ui-input flex-1 min-w-0 text-xs py-1 px-1.5"
                                    aria-label="Combatant name"
                                />
                                <input
                                    type="number"
                                    value={c.initiative ?? ""}
                                    onChange={(e) => combat.updateCombatant(c.id, { initiative: e.target.value === "" ? null : Number(e.target.value) })}
                                    placeholder="Init"
                                    className="ui-input w-12 text-xs py-1 px-1 text-center"
                                    aria-label="Initiative"
                                />
                                <button
                                    type="button"
                                    onClick={() => combat.rollInitiative(c.id)}
                                    className="ui-button min-h-7 px-1.5 text-[10px]"
                                    aria-label="Roll initiative (1d20)"
                                    title="Roll 1d20"
                                >
                                    d20
                                </button>
                                <button
                                    type="button"
                                    onClick={() => combat.removeCombatant(c.id)}
                                    className="text-muted hover:text-crimson text-xs px-1"
                                    aria-label={`Remove ${c.name}`}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] uppercase tracking-widest text-muted shrink-0">HP</span>
                                <input
                                    type="number"
                                    value={c.currentHP ?? ""}
                                    onChange={(e) => combat.updateCombatant(c.id, { currentHP: e.target.value === "" ? null : Number(e.target.value) })}
                                    placeholder="cur"
                                    className={`ui-input w-14 text-xs py-1 px-1 text-center ${isDown ? "text-crimson border-crimson/40" : ""}`}
                                    aria-label="Current HP"
                                />
                                <span className="text-muted text-xs">/</span>
                                <input
                                    type="number"
                                    value={c.maxHP ?? ""}
                                    onChange={(e) => combat.updateCombatant(c.id, { maxHP: e.target.value === "" ? null : Number(e.target.value) })}
                                    placeholder="max"
                                    className="ui-input w-14 text-xs py-1 px-1 text-center"
                                    aria-label="Max HP"
                                />
                                <input
                                    type="number"
                                    value={deltaInputs[c.id] ?? ""}
                                    onChange={(e) => setDeltaInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                    placeholder="amt"
                                    className="ui-input w-12 text-xs py-1 px-1 text-center ml-auto"
                                    aria-label="Damage/heal amount"
                                />
                                <button type="button" onClick={() => applyDelta(c, -1)} className="ui-button min-h-7 px-1.5 text-[10px] text-crimson" title="Apply damage" aria-label="Apply damage">−</button>
                                <button type="button" onClick={() => applyDelta(c, 1)} className="ui-button min-h-7 px-1.5 text-[10px] text-green-400" title="Apply healing" aria-label="Apply healing">+</button>
                            </div>

                            {c.kind === "party" && isDown && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] uppercase tracking-widest text-green-400/80">Success</span>
                                        {[1, 2, 3].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setDeathSave(c, "successes", (c.deathSaves?.successes ?? 0) >= n ? n - 1 : n)}
                                                className={`w-3.5 h-3.5 rounded-full border ${
                                                    (c.deathSaves?.successes ?? 0) >= n ? "bg-green-400 border-green-400" : "border-muted/40"
                                                }`}
                                                aria-label={`Death save success ${n}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] uppercase tracking-widest text-crimson/80">Fail</span>
                                        {[1, 2, 3].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setDeathSave(c, "failures", (c.deathSaves?.failures ?? 0) >= n ? n - 1 : n)}
                                                className={`w-3.5 h-3.5 rounded-full border ${
                                                    (c.deathSaves?.failures ?? 0) >= n ? "bg-crimson border-crimson" : "border-muted/40"
                                                }`}
                                                aria-label={`Death save failure ${n}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-1">
                                {c.conditions.map((condId) => {
                                    const def = getConditions(ruleset).find((cd) => cd.id === condId);
                                    return (
                                        <button
                                            key={condId}
                                            type="button"
                                            onClick={() => toggleCondition(c, condId)}
                                            title={def?.description}
                                            className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 border border-crimson/30 bg-crimson/10 text-crimson/90 rounded-sm hover:border-crimson/60 transition-colors"
                                        >
                                            {def?.abbr ?? condId} ✕
                                        </button>
                                    );
                                })}
                                <select
                                    value=""
                                    onChange={(e) => { if (e.target.value) toggleCondition(c, e.target.value as ConditionId); }}
                                    className="ui-select text-[9px] py-0.5 px-1 w-24"
                                    aria-label="Add condition"
                                >
                                    <option value="">+ Condition</option>
                                    {getConditions(ruleset)
                                        .filter((cd) => !c.conditions.includes(cd.id))
                                        .map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
