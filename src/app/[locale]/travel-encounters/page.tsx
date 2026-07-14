"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TRAVEL_ENCOUNTER_TABLES } from "@/app/utils/travelEncounter";
import { Select } from "@/app/components/atoms/Select";
import { Button } from "@/app/components/atoms/Button";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { useTravelEncounters, TERRAINS, type EncounterType } from "@/app/hooks/useTravelEncounters";
import { DiceRoll } from "./_components/DiceRoll";

export default function EncountersEnRoutePage() {
    const t = useTranslations("travelEncounters");
    const locale = useLocale();

    const {
        terrain, setTerrain,
        typeFilter, setTypeFilter,
        result,
        showTables, setShowTables,
        terrainMonsters,
        roll,
        builderParams,
    } = useTravelEncounters();

    const [isRolling, setIsRolling] = useState(false);
    const handleRoll = () => {
        if (isRolling) return;
        roll();
        setIsRolling(true);
    };

    return (
        <PageSection>
            <PageHeader title={t("title")} description={t("description")}>
            </PageHeader>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <FormField label={t("travellingTerrain")}>
                    <Select value={terrain} onChange={(e) => setTerrain(e.target.value as typeof terrain)} aria-label="Select travelling terrain">
                        {TERRAINS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </FormField>

                <FormField label={t("encounterType")}>
                    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EncounterType | "all")} aria-label="Filter by encounter type">
                        <option value="all">{t("allTypes")}</option>
                        <option value="combat">{t("combat")}</option>
                        <option value="survival">{t("survival")}</option>
                        <option value="social">{t("social")}</option>
                        <option value="hazard">{t("hazard")}</option>
                        <option value="benefit">{t("benefit")}</option>
                    </Select>
                </FormField>
            </div>

            <Button data-testid="roll-btn" onClick={handleRoll} disabled={isRolling} variant="primary" className="w-full py-4 text-xl font-serif tracking-widest uppercase">
                {t("rollForEncounter")}
            </Button>

            <div id="sr-announcer" className="sr-only" aria-live="polite"></div>

            {result && (
                <div className="flex justify-center py-2">
                    <DiceRoll value={result.roll} rolling={isRolling} onSettle={() => setIsRolling(false)} label={t("roll")} />
                </div>
            )}

            {result?.outcome && !isRolling && (
                <Card className="p-8 border-gold/10">
                    <div className="flex justify-between items-center border-b border-gold/20 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <h2 id="outcome-heading" className="text-2xl font-serif accent-gold uppercase tracking-wide">{t("outcome")}</h2>
                            <span className={`text-[10px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest shadow-glow ${
                                result.outcome.type === "combat" ? "bg-crimson/10 text-crimson border border-crimson/20" :
                                result.outcome.type === "survival" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                result.outcome.type === "benefit" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                            }`}>
                                {result.outcome.type}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-muted/60 mb-1">
                        {result.outcome.type === "combat" && "Roll initiative — monsters incoming"}
                        {result.outcome.type === "hazard" && "Environmental obstacle — no combat, but costs resources or time"}
                        {result.outcome.type === "benefit" && "Lucky find — the party gains something useful"}
                        {result.outcome.type === "social" && "Encounter involves NPCs or factions, not direct combat"}
                        {result.outcome.type === "survival" && "Wilderness challenge — weather, terrain, or exhaustion"}
                    </p>
                    <p data-testid="outcome-description" className="text-muted text-xl leading-relaxed italic font-serif py-4">
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
                                <a href={builderParams(locale)} className="ui-button px-6 text-sm font-bold uppercase tracking-widest inline-flex items-center">
                                    {t("openInEncounterBuilder")}
                                </a>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <div className="mt-6 flex flex-col gap-4">
                <Button onClick={() => setShowTables((prev) => !prev)} variant="secondary" className="w-full uppercase tracking-[0.2em] text-[11px]" aria-expanded={showTables}>
                    {showTables ? t("hideDmTables") : t("showDmTables")}
                </Button>

                {showTables && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-3">
                            <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">{t("dmTables")}: {terrain}</h3>
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
                                                item.type === "combat" ? "text-crimson" :
                                                item.type === "survival" ? "text-amber-500" :
                                                item.type === "benefit" ? "text-green-500" :
                                                "text-blue-400"
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
