"use client";

import { useMemo, useRef, useState } from "react";
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
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";

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
    const [groupTypes, setGroupTypes] = useState(2);
    const resultsRef = useRef<HTMLDivElement>(null);

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
            maxTypes: groupTypes,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budget, groupTypes]);

    const partyPresets = [
        { label: "3 PCs", size: 3 },
        { label: "4 PCs", size: 4 },
        { label: "5 PCs", size: 5 },
        { label: "6 PCs", size: 6 },
    ];

    const levelPresets = [
        { label: "Lv 3", level: 3 },
        { label: "Lv 5", level: 5 },
        { label: "Lv 10", level: 10 },
        { label: "Lv 15", level: 15 },
    ];

    const primarySolo = soloSuggestions[0];
    const primaryGroup = groupSuggestions[0];
    const formatGroupMembers = (members: { count: number; cr: number }[]) =>
        members.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ");
    const budgetStatus = (fit: number) => {
        if (fit >= 0.95 && fit <= 1.05) return { label: "On target", color: "text-green-400" };
        if (fit > 1.05) return { label: "Over budget", color: "text-crimson" };
        return { label: "Under budget", color: "text-amber-400" };
    };
    const primaryFit = mode === "solo" ? primarySolo?.fit : primaryGroup?.fit;
    const primaryStatus = primaryFit !== undefined ? budgetStatus(primaryFit) : null;

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
            <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                <div>
                    <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Encounter Builder</h1>
                    <p className="text-muted mt-2 font-light italic">
                        Create balanced encounters based on your party&apos;s level and size.
                    </p>
                    <p className="text-xs text-muted mt-2">2014/2024 toggles threshold and per-CR XP tables.</p>
                    <WhyDifferent className="mt-3" />
                </div>
                <Link href="/encounter-builder/docs" className="ui-link text-sm italic hidden sm:inline-flex">
                    View Documentation
                </Link>
            </header>

            <Card className="p-6 border-gold/10">
                <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] items-center">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Quick presets</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {partyPresets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    onClick={() => setPartySize(preset.size)}
                                    className="px-3 py-2 text-xs uppercase tracking-widest"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {levelPresets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    onClick={() => setAvgLevel(preset.level)}
                                    className="px-3 py-2 text-xs uppercase tracking-widest"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        Budget math: XP threshold × encounter multiplier. Ruleset choice changes thresholds and XP values.
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

                {mode === "group" && (
                    <FormField label="Mix Types">
                        <Select
                            value={groupTypes}
                            onChange={(e) => setGroupTypes(Number(e.target.value))}
                            aria-label="Maximum CR types in a group"
                        >
                            <option value={2}>2 Types</option>
                            <option value={3}>3 Types</option>
                            <option value={4}>4 Types</option>
                            <option value={5}>5 Types</option>
                        </Select>
                    </FormField>
                )}
            </div>

            <Button
                variant="primary"
                onClick={scrollToResults}
                className="w-full sm:w-auto px-10 py-3 uppercase tracking-widest font-serif"
            >
                Show Suggestions
            </Button>

            {/* Results */}
            <Card className="p-6" ref={resultsRef}>
                <div className="flex flex-col sm:flex-row sm:justify-between mb-8 border-b border-gold/10 pb-4">
                    <h2 className="font-serif text-2xl accent-gold uppercase tracking-wide">Suggested Encounters</h2>
                    <div className="text-sm font-medium mt-2 sm:mt-0 uppercase tracking-widest flex flex-col sm:items-end gap-2">
                        <span>
                            Total XP Budget: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span>
                        </span>
                        {primaryStatus && (
                            <span className={`text-[10px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest border border-gold/20 ${primaryStatus.color}`}>
                                Budget Status: {primaryStatus.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold text-gold/70">
                    <span className="border border-gold/20 px-3 py-1">Party {partySize}</span>
                    <span className="border border-gold/20 px-3 py-1">Level {avgLevel}</span>
                    <span className="border border-gold/20 px-3 py-1">{difficulty}</span>
                    <span className="border border-gold/20 px-3 py-1">{ruleset} ruleset</span>
                    <span className="border border-gold/20 px-3 py-1">{budgetMode} budget</span>
                    {mode === "group" && (
                        <span className="border border-gold/20 px-3 py-1">up to {groupTypes} types</span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">
                    <span>Export Preview</span>
                    <span className="text-muted normal-case tracking-normal">Snapshot for quick screenshot or print.</span>
                </div>

                {mode === "solo" && primarySolo && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Recommended Mix</div>
                        <div className="mt-2 font-serif text-lg accent-gold">
                            {`${primarySolo.count} × CR ${formatCR(primarySolo.cr)}`}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            Budget Fit {(primarySolo.fit * 100).toFixed(0)}% · {budgetStatus(primarySolo.fit).label}
                        </div>
                    </div>
                )}
                {mode === "group" && primaryGroup && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Recommended Mix</div>
                        <div className="mt-2 font-serif text-lg accent-gold">
                            {formatGroupMembers(primaryGroup.members)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            Budget Fit {(primaryGroup.fit * 100).toFixed(0)}% · {budgetStatus(primaryGroup.fit).label}
                        </div>
                    </div>
                )}

                {mode === "solo" ? (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {soloSuggestions.map((s, i) => (
                            <li key={i}>
                                <Card className="p-6 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-glow bg-bg/50">
                                    <div className="flex justify-between items-start">
                                        <div className="font-serif text-xl accent-gold">{s.count} &times; CR {formatCR(s.cr)}</div>
                                        <div className="text-muted text-xs font-bold uppercase">{s.adjustedXP} XP</div>
                                    </div>
                                    <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(s.fit).color}`}>
                                        {budgetStatus(s.fit).label}
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
                                    <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(g.fit).color}`}>
                                        {budgetStatus(g.fit).label}
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

            <div className="sm:hidden pt-4">
                <Link href="/encounter-builder/docs" className="ui-link text-sm italic inline-flex justify-center w-full">
                    View Documentation
                </Link>
            </div>
        </section>
    );
}
