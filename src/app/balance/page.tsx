"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    suggestEncounters,
    suggestGroupEncounters,
    partyBudget,
} from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";

type Mode = "solo" | "group";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

export default function CombatBalancerPage() {
    const [partySize, setPartySize] = useState(4);
    const [avgLevel, setAvgLevel] = useState(5);
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "deadly">("medium");
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
            <div className="grid gap-3 sm:grid-cols-6">
                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Party size</span>
                    <input className="ui-input" type="number" min={1} max={8}
                           value={partySize}
                           onChange={(e) => setPartySize(+e.target.value)}
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Avg Level</span>
                    <input className="ui-input" type="number" min={1} max={20}
                           value={avgLevel}
                           onChange={(e) => setAvgLevel(+e.target.value)}
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Ruleset</span>
                    <select className="ui-select" value={ruleset}
                            onChange={(e) => setRuleset(e.target.value as Ruleset)}>
                        <option value="2014">2014</option>
                        <option value="2024">2024</option>
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Difficulty</span>
                    <select className="ui-select" value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as string)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="deadly">Deadly</option>
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Budget Type</span>
                    <select className="ui-select" value={budgetMode}
                            onChange={(e) => setBudgetMode(e.target.value as BudgetMode)}>
                        <option value="encounter">Encounter</option>
                        <option value="daily">Daily</option>
                    </select>
                </label>

                <label className="grid gap-1">
                    <span className="text-sm text-zinc-400">Mode</span>
                    <select className="ui-select" value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}>
                        <option value="solo">Solo</option>
                        <option value="group">Group</option>
                    </select>
                </label>
            </div>

            {/* Results */}
            <div className="neo-card p-4">
                <div className="flex justify-between mb-3">
                    <h2 className="font-medium">Suggestions</h2>
                    <div className="text-sm text-zinc-400">
                        Budget: {budget.toLocaleString()} XP
                    </div>
                </div>

                {mode === "solo" ? (
                    <ul className="grid gap-2">
                        {soloSuggestions.map((s, i) => (
                            <li key={i} className="neo-card p-3">
                                <div className="flex justify-between">
                                    <div>{s.count} × CR {formatCR(s.cr)}</div>
                                    <div className="text-zinc-400">{s.adjustedXP} XP</div>
                                </div>
                                <div className="text-xs text-zinc-500">
                                    Fit {(s.fit * 100).toFixed(0)}%
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="grid gap-2">
                        {groupSuggestions.map((g, i) => (
                            <li key={i} className="neo-card p-3">
                                <div className="flex justify-between">
                                    <div>
                                        {g.members.map(m => `${m.count}×CR ${formatCR(m.cr)}`).join(", ")}
                                    </div>
                                    <div className="text-zinc-400">{g.adjustedXP} XP</div>
                                </div>
                                <div className="text-xs text-zinc-500">
                                    Fit {(g.fit * 100).toFixed(0)}%
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
