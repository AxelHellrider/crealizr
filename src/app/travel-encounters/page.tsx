"use client";

import { useState } from "react";
import {
  Terrain,
  getTravelEncounter,
  rollD500,
  TRAVEL_ENCOUNTER_TABLES,
  EncounterOutcome,
  EncounterType,
  TERRAINS
} from "@/app/utils/travelEncounter";
import { Select } from "@/app/components/atoms/Select";
import { Input } from "@/app/components/atoms/Input";
import { Button } from "@/app/components/atoms/Button";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { Difficulty, partyBudget, suggestEncounters, suggestGroupEncounters } from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";

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
  const [difficulty] = useState<Difficulty>("medium");
  const [showTables, setShowTables] = useState(false);

  const handleRoll = () => {
    const roll = rollD500();
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

  const terrains: Terrain[] = TERRAINS;

  return (
    <div className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Encounters en route</h1>
          <p className="text-muted mt-2 font-light italic">
            Plan encounters for long journeys based on terrain.
          </p>
          <WhyDifferent className="mt-3" />
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Travelling Terrain">
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
        </FormField>

        <FormField label="Encounter Type">
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
        </FormField>
      </div>

      <Button
        onClick={handleRoll}
        variant="primary"
        className="w-full py-4 text-xl font-serif tracking-widest uppercase"
      >
        Roll for Encounter
      </Button>

      {/* SR-only live region for rolling results */}
      <div id="sr-announcer" className="sr-only" aria-live="polite"></div>

      {result && result.outcome && (
        <Card className="p-8 border-gold/10">
          <div className="flex justify-between items-center border-b border-gold/20 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 id="outcome-heading" className="text-2xl font-serif accent-gold uppercase tracking-wide">Outcome</h2>
              <span className={`text-[10px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest shadow-glow ${
                result.outcome.type === 'combat' ? 'bg-crimson/10 text-crimson border border-crimson/20' :
                result.outcome.type === 'survival' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                result.outcome.type === 'benefit' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                'bg-blue-400/10 text-blue-400 border border-blue-400/20'
              }`}>
                {result.outcome.type}
              </span>
            </div>
            <div className="text-sm font-medium uppercase tracking-widest">
              Roll: <span className="accent-gold font-bold">{result.roll}</span>
            </div>
          </div>
          <p className="text-muted text-xl leading-relaxed italic font-serif py-4">
            &quot;{result.outcome.description}&quot;
          </p>

          {result.outcome.type === "combat" && (
            <div className="mt-8 pt-8 border-t border-gold/10">
              {!showBalancer ? (
                <Button
                  onClick={() => setShowBalancer(true)}
                  className="px-6 text-sm font-bold uppercase tracking-widest"
                >
                  Balance this Encounter
                </Button>
              ) : (
                <div className="grid gap-6">
                  <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                    <h3 className="font-serif text-lg accent-gold uppercase tracking-wide">Encounter Balancer</h3>
                    <button 
                      onClick={() => setShowBalancer(false)}
                      className="text-[10px] text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Party size">
                      <Input 
                        type="number" 
                        min={1} 
                        value={partySize}
                        onChange={(e) => setPartySize(+e.target.value)}
                        aria-label="Party size"
                      />
                    </FormField>
                    <FormField label="Avg Level">
                      <Input 
                        type="number" 
                        min={1} 
                        max={20}
                        value={avgLevel}
                        onChange={(e) => setAvgLevel(+e.target.value)}
                        aria-label="Average Level"
                      />
                    </FormField>
                  </div>

                  <div className="text-sm font-medium uppercase tracking-widest">
                    Target Budget: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span> <span className="text-muted font-normal italic">({difficulty})</span>
                  </div>

                  <div className="grid gap-4">
                    <h4 className="text-[10px] uppercase text-gold/60 font-bold tracking-[0.2em]">Solo Suggestions</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {soloSuggestions.slice(0, 4).map((s, i) => (
                        <Card key={i} className="p-4 border border-gold/10 bg-bg/50">
                          <div className="font-serif text-lg accent-gold">{s.count} × CR {formatCR(s.cr)}</div>
                          <div className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{s.adjustedXP} XP</div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <h4 className="text-[10px] uppercase text-silver/60 font-bold tracking-[0.2em]">Group Suggestions</h4>
                    <div className="grid gap-3">
                      {groupSuggestions.slice(0, 2).map((g, i) => (
                        <Card key={i} className="p-4 border border-silver/10 bg-bg/50 flex justify-between items-center">
                          <div className="font-serif">
                            {g.members.map((m, idx) => (
                              <span key={idx}>
                                <span className="font-bold text-lg accent-gold">{m.count}</span>
                                <span className="text-muted mx-1 font-sans italic">×</span>
                                <span className="text-foreground text-base">CR {formatCR(m.cr)}</span>
                                {idx < g.members.length - 1 && <span className="text-gold/30 mx-3">|</span>}
                              </span>
                            ))}
                          </div>
                          <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{g.adjustedXP} XP</span>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Button
          onClick={() => setShowTables((prev) => !prev)}
          variant="secondary"
          className="w-full uppercase tracking-[0.2em] text-[11px]"
          aria-expanded={showTables}
        >
          {showTables ? "Hide DM Tables" : "Show DM Tables"}
        </Button>

        {showTables && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-3">
              <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">
                DM Tables: {terrain}
              </h3>
              {typeFilter !== "all" && (
                <span className="text-[10px] px-3 py-1 bg-gold/5 text-gold rounded-sm border border-gold/20 uppercase font-bold tracking-widest shadow-glow">
                  Filter: {typeFilter}
                </span>
              )}
            </div>
            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {TRAVEL_ENCOUNTER_TABLES[terrain]
                .filter((item) => typeFilter === "all" || item.type === typeFilter)
                .map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-sm bg-card border border-gold/5 hover:border-gold/20 transition-all">
                    <span className="font-mono w-20 flex-shrink-0 text-center rounded-sm border border-gold/20 bg-gold/5 py-1 text-gold font-bold">
                      {item.range[0] === item.range[1] ? item.range[0] : `${item.range[0]}-${item.range[1]}`}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-foreground font-light">{item.description}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-[0.1em] ${
                        item.type === 'combat' ? 'text-crimson' :
                        item.type === 'survival' ? 'text-amber-500' :
                        item.type === 'benefit' ? 'text-green-500' :
                        'text-blue-400'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
