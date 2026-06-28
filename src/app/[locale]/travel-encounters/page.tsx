"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
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
import { Button } from "@/app/components/atoms/Button";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import type { Monster } from "@/app/types/monster";

type CatalogTerrain = Monster["terrain"][number];

const TERRAIN_TO_CATALOG: Record<Terrain, CatalogTerrain[]> = {
  Forest: ["wilderness"],
  Desert: ["wilderness"],
  Mountains: ["wilderness"],
  Plains: ["wilderness"],
  Swamp: ["wilderness"],
  Arctic: ["wilderness"],
  Coast: ["wilderness", "underwater"],
  Underdark: ["dungeon"],
};

export default function EncountersEnRoutePage() {
  const t = useTranslations("travelEncounters");
  const locale = useLocale();
  const [terrain, setTerrain] = useState<Terrain>("Forest");
  const [typeFilter, setTypeFilter] = useState<EncounterType | "all">("all");
  const [result, setResult] = useState<{
    roll: number;
    outcome: EncounterOutcome | null;
  } | null>(null);

  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(5);
  const [showTables, setShowTables] = useState(false);
  const { catalog2014 } = useMergedCatalog();

  const terrainMonsters = useMemo(() => {
    const catalogTerrains = TERRAIN_TO_CATALOG[terrain];
    return catalog2014.filter((m) => m.terrain.some((t) => catalogTerrains.includes(t as CatalogTerrain)));
  }, [catalog2014, terrain]);

  const handleRoll = () => {
    const roll = rollD500();
    const outcome = getTravelEncounter(terrain, roll, typeFilter);
    setResult({ roll, outcome });

    const message = outcome
      ? `Rolled ${roll}. Outcome: ${outcome.description}. Type: ${outcome.type}.`
      : `Rolled ${roll}. No outcome found.`;
    const announcer = document.getElementById("sr-announcer");
    if (announcer) announcer.textContent = message;
  };

  const builderHref = `/${locale}/encounter-builder?partySize=${partySize}&avgLevel=${avgLevel}&difficulty=medium&mode=group&relation=terrain&filterTerrain=${TERRAIN_TO_CATALOG[terrain][0]}`;

  const terrains: readonly Terrain[] = TERRAINS;

  return (
    <PageSection>
      <PageHeader title={t("title")} description={t("description")}>
        <WhyDifferent className="mt-3 lg:mt-0" />
      </PageHeader>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <FormField label={t("travellingTerrain")}>
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

        <FormField label={t("encounterType")}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EncounterType | "all")}
            aria-label="Filter by encounter type"
          >
            <option value="all">{t("allTypes")}</option>
            <option value="combat">{t("combat")}</option>
            <option value="survival">{t("survival")}</option>
            <option value="social">{t("social")}</option>
            <option value="hazard">{t("hazard")}</option>
            <option value="benefit">{t("benefit")}</option>
          </Select>
        </FormField>
      </div>

      <Button
        onClick={handleRoll}
        variant="primary"
        className="w-full py-4 text-xl font-serif tracking-widest uppercase"
      >
        {t("rollForEncounter")}
      </Button>

      {/* SR-only live region for rolling results */}
      <div id="sr-announcer" className="sr-only" aria-live="polite"></div>

      {result && result.outcome && (
        <Card className="p-8 border-gold/10">
          <div className="flex justify-between items-center border-b border-gold/20 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 id="outcome-heading" className="text-2xl font-serif accent-gold uppercase tracking-wide">{t("outcome")}</h2>
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
              {t("roll")}: <span className="accent-gold font-bold">{result.roll}</span>
            </div>
          </div>
          <p className="text-muted text-xl leading-relaxed italic font-serif py-4">
            &quot;{result.outcome.description}&quot;
          </p>

          {result.outcome.type === "combat" && (
            <div className="mt-8 pt-8 border-t border-gold/10 flex flex-col gap-4">
              {terrainMonsters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {terrainMonsters.slice(0, 10).map((m) => (
                    <span key={m.name} className="text-[10px] px-2 py-1 rounded-sm bg-crimson/10 text-crimson border border-crimson/20 uppercase font-bold tracking-widest">
                      {m.name}
                    </span>
                  ))}
                  {terrainMonsters.length > 10 && (
                    <span className="text-[10px] px-2 py-1 text-muted">+{terrainMonsters.length - 10} more</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={builderHref}
                  className="ui-button px-6 text-sm font-bold uppercase tracking-widest inline-flex items-center"
                >
                  {t("openInEncounterBuilder")}
                </Link>
              </div>
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
          {showTables ? t("hideDmTables") : t("showDmTables")}
        </Button>

        {showTables && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-3">
              <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">
                {t("dmTables")}: {terrain}
              </h3>
              {typeFilter !== "all" && (
                <span className="text-[10px] px-3 py-1 bg-gold/5 text-gold rounded-sm border border-gold/20 uppercase font-bold tracking-widest shadow-glow">
                  {t("filter")}: {typeFilter}
                </span>
              )}
            </div>
            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {TRAVEL_ENCOUNTER_TABLES[terrain]
                .filter((item) => typeFilter === "all" || item.type === typeFilter)
                .map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-sm bg-card border border-gold/5 hover:border-gold/20 transition-all">
                    <span className="font-mono w-16 flex-shrink-0 text-center rounded-sm border border-gold/20 bg-gold/5 py-1 text-gold font-bold">
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
                      {item.type === "combat" && terrainMonsters.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {terrainMonsters.slice(0, 5).map((m) => (
                            <span key={m.name} className="text-[9px] px-2 py-0.5 rounded-sm bg-crimson/10 text-crimson border border-crimson/20 uppercase font-bold tracking-wide">
                              {m.name}
                            </span>
                          ))}
                          {terrainMonsters.length > 5 && (
                            <span className="text-[9px] text-muted px-1">+{terrainMonsters.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </PageSection>
  );
}
