"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  suggestEncounters,
  partyBudget,
  suggestGroupEncounters,
  suggestEncounters2024,
  partyBudget2024,
  suggestGroupEncounters2024,
} from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";

type Mode = "solo" | "group";
type Ruleset = "2014" | "2024";

export default function CombatBalancerPage() {
  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "deadly">("medium");
  const [mode, setMode] = useState<Mode>("solo");
  const [ruleset, setRuleset] = useState<Ruleset>("2014");

  const soloSuggestions = useMemo(() => {
    return ruleset === "2024"
      ? suggestEncounters2024({ level: avgLevel, size: partySize, difficulty })
      : suggestEncounters({ level: avgLevel, size: partySize, difficulty });
  }, [partySize, avgLevel, difficulty, ruleset]);

  const groupSuggestions = useMemo(() => {
    return ruleset === "2024"
      ? suggestGroupEncounters2024({ level: avgLevel, size: partySize, difficulty })
      : suggestGroupEncounters({ level: avgLevel, size: partySize, difficulty });
  }, [partySize, avgLevel, difficulty, ruleset]);

  const budget = useMemo(() => (
    ruleset === "2024" ? partyBudget2024(avgLevel, partySize, difficulty) : partyBudget(avgLevel, partySize, difficulty)
  ), [partySize, avgLevel, difficulty, ruleset]);

  return (
    <section className="grid gap-6 glass-panel p-6">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Combat Balancer</h1>
          <p className="text-zinc-400">Get encounter suggestions tuned to your party and desired difficulty.</p>
        </div>
        <Link href="/balance/docs" className="ui-link text-sm">How it works</Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-5">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Party size</span>
          <input className="ui-input w-full" type="number" min={1} max={8} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Average level</span>
          <input className="ui-input w-full" type="number" min={1} max={20} value={avgLevel} onChange={(e) => setAvgLevel(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Ruleset</span>
          <select className="ui-select w-full" value={ruleset} onChange={(e) => setRuleset(e.target.value as Ruleset)}>
            <option value="2014">2014</option>
            <option value="2024">2024</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Difficulty</span>
          <select
            className="ui-select w-full"
            value={difficulty}
            onChange={(e) => {
              const val = e.target.value as "easy" | "medium" | "hard" | "deadly";
              setDifficulty(val);
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="deadly">Deadly</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Mode</span>
          <select className="ui-select w-full" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="solo">Solo (identical foes)</option>
            <option value="group">Groups (mixed CRs)</option>
          </select>
        </label>
      </div>

      <div className="neo-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Top Suggestions</h2>
          <div className="text-sm text-zinc-400">Budget: {budget.toLocaleString()} XP</div>
        </div>
        {mode === "solo" ? (
          <ul className="grid gap-2">
            {soloSuggestions.map((s, idx) => (
              <li key={`${s.cr}-${s.count}-${idx}`} className="neo-card p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.count} × CR {formatCR(s.cr)}</div>
                  <div className="text-sm text-zinc-400">Adj. XP: {s.adjustedXP.toLocaleString()}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">Fit: {(s.fit * 100).toFixed(0)}% • Base XP each: {s.xpEach.toLocaleString()}</div>
              </li>
            ))}
            {soloSuggestions.length === 0 && (
              <li className="text-sm text-zinc-400">No close matches. Try changing difficulty or level.</li>
            )}
          </ul>
        ) : (
          <ul className="grid gap-2">
            {groupSuggestions.map((g, idx) => (
              <li key={g.members.map(m=>`${m.cr}-${m.count}`).join("_")+idx} className="neo-card p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{g.totalCount} total • {g.members.map(m => `${m.count}×CR ${formatCR(m.cr)}`).join(", ")}</div>
                  <div className="text-sm text-zinc-400">Adj. XP: {g.adjustedXP.toLocaleString()}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">Fit: {(g.fit * 100).toFixed(0)}%</div>
              </li>
            ))}
            {groupSuggestions.length === 0 && (
              <li className="text-sm text-zinc-400">No close matches. Try changing difficulty or level.</li>
            )}
          </ul>
        )}
      </div>

      <p className="text-xs text-zinc-500">Using {ruleset} XP thresholds and multipliers. Adjust to taste at your table.</p>
    </section>
  );
}
