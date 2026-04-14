"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    partyBudget,
    suggestEncounters,
    suggestGroupEncounters,
} from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";

type Mode = "solo" | "group";
type Difficulty = "easy" | "medium" | "hard" | "deadly";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

export default function CombatBalancerPage() {
    const [partySize, setPartySize] = useState(4);
    const [avgLevel, setAvgLevel] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [mode, setMode] = useState<Mode>("solo");
    const [ruleset, setRuleset] = useState<Ruleset>("2014");
    const [budgetMode, setBudgetMode] = useState<BudgetMode>("encounter");

    const budget = useMemo(() => {
        return partyBudget({
            level: avgLevel,
            size: partySize,
            difficulty,
            ruleset,
            mode: budgetMode,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budgetMode]);

    const soloSuggestions = useMemo(() => {
        return suggestEncounters({
            level: avgLevel,
            size: partySize,
            difficulty,
            ruleset,
            budget,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budget]);

    const groupSuggestions = useMemo(() => {
        return suggestGroupEncounters({
            level: avgLevel,
            size: partySize,
            difficulty,
            ruleset,
            budget,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budget]);

    return (
        <section className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
            <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                <div>
                    <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Combat Balancer</h1>
                    <p className="text-muted mt-2 font-light italic">
                        Create balanced encounters based on your party&apos;s level and size.
                    </p>
                </div>
                <Link href="/balance/docs" className="ui-link text-sm italic">
                    View Documentation
                </Link>
            </header>

            {/* Controls */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <FormField label="Party Size">
                    <Input type="number" min={1} max={8}
                           value={partySize}
                           onChange={(e) => setPartySize(+e.target.value)}
                           aria-label="Party size (number of players)"
                    />
                </FormField>

                <FormField label="Average Level">
                    <Input type="number" min={1} max={20}
                           value={avgLevel}
                           onChange={(e) => setAvgLevel(+e.target.value)}
                           aria-label="Average party level"
                    />
                </FormField>

                <FormField label="Ruleset">
                    <Select value={ruleset}
                            onChange={(e) => setRuleset(e.target.value as Ruleset)}
                            aria-label="Ruleset version">
                        <option value="2014">2014 Ruleset</option>
                        <option value="2024">2024 Ruleset</option>
                    </Select>
                </FormField>

                <FormField label="Difficulty">
                    <Select value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            aria-label="Encounter difficulty">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="deadly">Deadly</option>
                    </Select>
                </FormField>

                <FormField label="Budget Type">
                    <Select value={budgetMode}
                            onChange={(e) => setBudgetMode(e.target.value as BudgetMode)}
                            aria-label="XP budget type">
                        <option value="encounter">Encounter Budget</option>
                        <option value="daily">Daily Budget</option>
                    </Select>
                </FormField>

                <FormField label="Formation">
                    <Select value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}
                            aria-label="Encounter type mode">
                        <option value="solo">Solo Boss</option>
                        <option value="group">Horde / Group</option>
                    </Select>
                </FormField>
            </div>

            {/* Results */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between mb-8 border-b border-gold/10 pb-4">
                    <h2 className="font-serif text-2xl accent-gold uppercase tracking-wide">Suggested Encounters</h2>
                    <div className="text-sm font-medium mt-2 sm:mt-0 uppercase tracking-widest">
                        Total XP Budget: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span>
                    </div>
                </div>

                {mode === "solo" ? (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {soloSuggestions.map((s, i) => (
                            <li key={i}>
                                <Card className="p-6 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-glow bg-bg/50">
                                    <div className="flex justify-between items-start">
                                        <div className="font-serif text-xl accent-gold">{s.count} &times; CR {formatCR(s.cr)}</div>
                                        <div className="text-muted text-xs font-bold uppercase">{s.adjustedXP} XP</div>
                                    </div>
                                    <div className="mt-4 h-1 w-full bg-gold/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]" style={{ width: `${s.fit * 100}%` }} />
                                    </div>
                                    <div className="mt-2 text-right text-[10px] text-gold/60 uppercase tracking-widest font-bold">
                                        Budget Fit {(s.fit * 100).toFixed(0)}%
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                        {groupSuggestions.map((g, i) => (
                            <li key={i}>
                                <Card className="p-6 border border-silver/10 hover:border-silver/30 transition-all hover:shadow-glow bg-bg/50">
                                    <div className="flex justify-between items-start">
                                        <div className="font-serif">
                                            {g.members.map((m, idx) => (
                                                <span key={idx}>
                                                    <span className="font-bold text-xl accent-gold">{m.count}</span>
                                                    <span className="text-muted mx-1 font-sans italic">&times;</span>
                                                    <span className="text-foreground text-lg">CR {formatCR(m.cr)}</span>
                                                    {idx < g.members.length - 1 && <span className="text-gold/30 mx-3">|</span>}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-muted text-xs font-bold uppercase whitespace-nowrap ml-4">{g.adjustedXP} XP</div>
                                    </div>
                                    <div className="mt-4 h-1 w-full bg-silver/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" style={{ width: `${g.fit * 100}%` }} />
                                    </div>
                                    <div className="mt-2 text-right text-[10px] text-silver/60 uppercase tracking-widest font-bold">
                                        Budget Fit {(g.fit * 100).toFixed(0)}%
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <p className="text-xs text-muted italic text-center">
                Calculations based on standard XP thresholds and encounter multipliers.
            </p>
        </section>
    );
}
