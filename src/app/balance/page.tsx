"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    partyBudget,
    suggestEncounters,
    suggestGroupEncounters,
} from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";

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
        <section className="grid gap-6 glass-panel p-6">
            <header className="flex items-baseline justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Combat Balancer</h1>
                    <p className="text-zinc-400">
                        Generate balanced encounters based on party strength.
                    </p>
                </div>
                <Link href="/balance/docs" className="ui-link text-sm">
                    How it works
                </Link>
            </header>

            {/* Controls */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Party size</span>
                    <Input type="number" min={1} max={8}
                           value={partySize}
                           onChange={(e) => setPartySize(+e.target.value)}
                           aria-label="Party size (number of players)"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Avg Level</span>
                    <Input type="number" min={1} max={20}
                           value={avgLevel}
                           onChange={(e) => setAvgLevel(+e.target.value)}
                           aria-label="Average party level"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Ruleset</span>
                    <Select value={ruleset}
                            onChange={(e) => setRuleset(e.target.value as Ruleset)}
                            aria-label="Ruleset version">
                        <option value="2014">2014</option>
                        <option value="2024">2024</option>
                    </Select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Difficulty</span>
                    <Select value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            aria-label="Encounter difficulty">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="deadly">Deadly</option>
                    </Select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Budget Type</span>
                    <Select value={budgetMode}
                            onChange={(e) => setBudgetMode(e.target.value as BudgetMode)}
                            aria-label="XP budget type">
                        <option value="encounter">Encounter</option>
                        <option value="daily">Daily</option>
                    </Select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Mode</span>
                    <Select value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}
                            aria-label="Encounter type mode">
                        <option value="solo">Solo</option>
                        <option value="group">Group</option>
                    </Select>
                </label>
            </div>

            {/* Results */}
            <div className="neo-card p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between mb-4 border-b border-zinc-800 pb-2">
                    <h2 className="font-medium text-lg">Suggestions</h2>
                    <div className="text-sm text-zinc-400 mt-1 sm:mt-0">
                        Total Budget: <span className="text-teal-400 font-semibold">{budget.toLocaleString()} XP</span>
                    </div>
                </div>

                {mode === "solo" ? (
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {soloSuggestions.map((s, i) => (
                            <li key={i} className="neo-card p-4 border border-white/5 hover:border-teal-400/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="font-semibold text-lg">{s.count} × CR {formatCR(s.cr)}</div>
                                    <div className="text-zinc-400 text-sm">{s.adjustedXP} XP</div>
                                </div>
                                <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400" style={{ width: `${s.fit * 100}%` }} />
                                </div>
                                <div className="mt-1 text-right text-[10px] text-zinc-500 uppercase tracking-wider">
                                    Budget Fit {(s.fit * 100).toFixed(0)}%
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                        {groupSuggestions.map((g, i) => (
                            <li key={i} className="neo-card p-4 border border-white/5 hover:border-teal-400/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="font-medium">
                                        {g.members.map((m, idx) => (
                                            <span key={idx}>
                                                <span className="font-bold text-lg">{m.count}</span>
                                                <span className="text-zinc-400 mx-1">×</span>
                                                <span className="text-zinc-200">CR {formatCR(m.cr)}</span>
                                                {idx < g.members.length - 1 && <span className="text-zinc-600 mx-2">|</span>}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-zinc-400 text-sm whitespace-nowrap ml-4">{g.adjustedXP} XP</div>
                                </div>
                                <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400" style={{ width: `${g.fit * 100}%` }} />
                                </div>
                                <div className="mt-1 text-right text-[10px] text-zinc-500 uppercase tracking-wider">
                                    Budget Fit {(g.fit * 100).toFixed(0)}%
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="text-xs text-zinc-500">
                Uses official XP math + encounter multipliers. Daily budget ≈ 6–8 encounters.
            </p>
        </section>
    );
}
