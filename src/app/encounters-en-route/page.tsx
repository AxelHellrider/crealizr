"use client";

import { useState } from "react";
import {
  Terrain,
  getTravelEncounter,
  rollD200,
  TRAVEL_ENCOUNTER_TABLES,
  EncounterOutcome,
  EncounterType
} from "@/app/utils/travelEncounter";
import { Select } from "@/app/components/ui/Select";
import { Card, CardContent } from "@/app/components/ui/Card";
import { Difficulty, partyBudget, suggestEncounters, suggestGroupEncounters } from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";

export default function EncountersEnRoutePage() {
  const [terrain, setTerrain] = useState<Terrain>("Forest");
  const [typeFilter, setTypeFilter] = useState<EncounterType | "all">("all");
  const [result, setResult] = useState<{
    roll: number;
    outcome: EncounterOutcome | null;
  } | null>(null);

  const [showBalancer, setShowBalancer] = useState(false);
  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const handleRoll = () => {
    const roll = rollD200();
    const outcome = getTravelEncounter(terrain, roll, typeFilter);
    setResult({ roll, outcome });
    setShowBalancer(false);
    
    // Announce the result to screen readers
    const message = outcome 
      ? `Rolled ${roll}. Outcome: ${outcome.description}. Type: ${outcome.type}.`
      : `Rolled ${roll}. No outcome found.`;
    
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  };

  const budget = partyBudget({
    level: avgLevel,
    size: partySize,
    difficulty: difficulty,
    ruleset: "2014",
    mode: "encounter",
  });

  const soloSuggestions = suggestEncounters({
    level: avgLevel,
    size: partySize,
    difficulty: difficulty,
    ruleset: "2014",
    budget,
  });

  const groupSuggestions = suggestGroupEncounters({
    level: avgLevel,
    size: partySize,
    difficulty: difficulty,
    ruleset: "2014",
    budget,
  });

  const terrains: Terrain[] = Object.keys(TRAVEL_ENCOUNTER_TABLES) as Terrain[];

  return (
    <div className="grid gap-6 glass-panel p-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Encounters en route</h1>
        <p className="text-zinc-400">
          Plan encounters for long journeys based on terrain.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Travelling Terrain</span>
          <Select
            value={terrain}
            onChange={(e) => setTerrain(e.target.value as Terrain)}
            aria-label="Select travelling terrain"
          >
            {terrains.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Encounter Type</span>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EncounterType | "all")}
            aria-label="Filter by encounter type"
          >
            <option value="all">All Types</option>
            <option value="combat">Combat</option>
            <option value="survival">Survival</option>
            <option value="social">Social</option>
            <option value="hazard">Hazard</option>
            <option value="benefit">Benefit</option>
          </Select>
        </label>
      </div>

      <button
        onClick={handleRoll}
        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold rounded-lg transition-colors shadow-lg shadow-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      >
        Roll for Encounter
      </button>

      {/* SR-only live region for rolling results */}
      <div id="sr-announcer" className="sr-only" aria-live="polite"></div>

      {result && result.outcome && (
        <Card>
          <CardContent aria-labelledby="outcome-heading">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <h2 id="outcome-heading" className="text-lg font-medium text-teal-400">Outcome</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                  result.outcome.type === 'combat' ? 'bg-red-500/20 text-red-400' :
                  result.outcome.type === 'survival' ? 'bg-amber-500/20 text-amber-400' :
                  result.outcome.type === 'benefit' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {result.outcome.type}
                </span>
              </div>
              <div className="text-sm text-zinc-500">
                Roll: <span className="text-white font-mono">{result.roll}</span>
              </div>
            </div>
            <p className="text-zinc-200 text-lg leading-relaxed italic">
              "{result.outcome.description}"
            </p>

            {result.outcome.type === "combat" && (
              <div className="mt-4 pt-4 border-t border-white/10">
                {!showBalancer ? (
                  <button
                    onClick={() => setShowBalancer(true)}
                    className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                  >
                    Balance this Encounter
                  </button>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">Encounter Balancer</h3>
                      <button 
                        onClick={() => setShowBalancer(false)}
                        className="text-xs text-zinc-500 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <label className="grid gap-1">
                        <span className="text-xs text-zinc-400">Party size</span>
                        <input 
                          type="number" 
                          min={1} 
                          value={partySize}
                          onChange={(e) => setPartySize(+e.target.value)}
                          aria-label="Party size"
                          className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-xs text-zinc-400">Avg Level</span>
                        <input 
                          type="number" 
                          min={1} 
                          max={20}
                          value={avgLevel}
                          onChange={(e) => setAvgLevel(+e.target.value)}
                          aria-label="Average Level"
                          className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                        />
                      </label>
                    </div>

                    <div className="text-xs text-zinc-400">
                      Target Budget: <span className="text-teal-400 font-bold">{budget} XP</span> ({difficulty})
                    </div>

                    <div className="grid gap-2">
                      <h4 className="text-[10px] uppercase text-zinc-500 font-bold">Solo Suggestions</h4>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {soloSuggestions.slice(0, 4).map((s, i) => (
                          <div key={i} className="flex-shrink-0 bg-white/5 border border-white/5 p-2 rounded text-xs">
                            <div className="font-bold text-white">{s.count} × CR {formatCR(s.cr)}</div>
                            <div className="text-zinc-500">{s.adjustedXP} XP</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <h4 className="text-[10px] uppercase text-zinc-500 font-bold">Group Suggestions</h4>
                      <div className="grid gap-2">
                        {groupSuggestions.slice(0, 2).map((g, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 p-2 rounded text-xs flex justify-between">
                            <div>
                              {g.members.map((m, idx) => (
                                <span key={idx}>
                                  <span className="font-bold text-white">{m.count}</span>
                                  <span className="text-zinc-500 mx-1">×</span>
                                  <span className="text-zinc-300">CR {formatCR(m.cr)}</span>
                                  {idx < g.members.length - 1 && <span className="text-zinc-600 mx-2">|</span>}
                                </span>
                              ))}
                            </div>
                            <span className="text-zinc-500">{g.adjustedXP} XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Current Table: {terrain}
          </h3>
          {typeFilter !== "all" && (
            <span className="text-[10px] px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20 uppercase font-bold">
              Filtered by: {typeFilter}
            </span>
          )}
        </div>
        <div className="grid gap-2 text-xs max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {TRAVEL_ENCOUNTER_TABLES[terrain]
            .filter((item) => typeFilter === "all" || item.type === typeFilter)
            .map((item, idx) => (
            <div key={idx} className="flex gap-3 p-2 rounded bg-white/5 border border-white/5">
              <span className={`text-teal-400 font-mono w-16 flex-shrink-0 text-center rounded border border-teal-400/20 bg-teal-400/5 py-0.5`}>
                {item.range[0] === item.range[1] ? item.range[0] : `${item.range[0]}-${item.range[1]}`}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-300">{item.description}</span>
                <span className={`text-[9px] uppercase font-bold ${
                  item.type === 'combat' ? 'text-red-400' :
                  item.type === 'survival' ? 'text-amber-400' :
                  item.type === 'benefit' ? 'text-green-400' :
                  'text-blue-400'
                }`}>
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
