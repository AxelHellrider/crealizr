"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
    partyBudget,
    getMonstersForCR,
    suggestGroupEncounters,
    suggestBossWithMinions,
} from "@/app/utils/encounter";
import type { Terrain, Affiliation, Monster } from "@/app/types/monster";
import { formatCR } from "@/app/lib/format";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { FormField } from "@/app/components/molecules/FormField";
import { ToggleChip } from "@/app/components/molecules/ToggleChip";

import { FilterBadge } from "@/app/components/molecules/FilterBadge";
import { MonsterFilterPanel, type RelationCriteria } from "@/app/components/organisms/MonsterFilterPanel";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";

type Mode = "solo" | "group";
type Difficulty = "easy" | "medium" | "hard" | "deadly";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

function BudgetBar({ fit, budgetFitLabel, accent = "gold" }: { fit: number; budgetFitLabel: string; accent?: "gold" | "silver" }) {
    return (
        <>
            <div className={`mt-4 h-px w-full ${accent === "silver" ? "bg-silver/10" : "bg-gold/10"} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${accent === "silver" ? "bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" : "bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]"}`}
                    style={{ width: `${Math.min(fit * 100, 100)}%` }}
                />
            </div>
            <div className={`mt-2 text-right text-[10px] ${accent === "silver" ? "text-silver/60" : "text-gold/60"} uppercase tracking-widest font-bold`}>
                {budgetFitLabel} {(fit * 100).toFixed(0)}%
            </div>
        </>
    );
}

export default function CombatBalancerPage() {
    const locale = useLocale();
    const t = useTranslations("encounterBuilder");
    const [partySize, setPartySize] = useState(4);
    const [avgLevel, setAvgLevel] = useState(5);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [mode, setMode] = useState<Mode>("solo");
    const [ruleset, setRuleset] = useState<Ruleset>("2014");
    const [budgetMode, setBudgetMode] = useState<BudgetMode>("encounter");
    const [groupTypes, setGroupTypes] = useState(2);
    const [includeMinions, setIncludeMinions] = useState(false);
    const [relationCriteria, setRelationCriteria] = useState<RelationCriteria>("any");
    const [filterTerrain, setFilterTerrain] = useState<Terrain | "">("");
    const [filterAffiliation, setFilterAffiliation] = useState<Affiliation | "">("");
    const [filterGenus, setFilterGenus] = useState("");
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(0);
    const resultsRef = useRef<HTMLDivElement>(null);
    const { catalog2014, catalog2024 } = useMergedCatalog();
    const catalog = ruleset === "2024" ? catalog2024 : catalog2014;

    const knownGenera = useMemo(() => {
        return [...new Set(catalog.map((m) => m.genus).filter(Boolean) as string[])].sort();
    }, [catalog]);

    const filterMonsterPool = (monsters: Monster[]): Monster[] => {
        if (relationCriteria === "terrain" && filterTerrain) {
            return monsters.filter((m) => m.terrain.includes(filterTerrain) || m.terrain.includes("any"));
        }
        if (relationCriteria === "affiliation" && filterAffiliation) {
            return monsters.filter((m) => m.affiliation === filterAffiliation || m.affiliation === "any");
        }
        if (relationCriteria === "genus" && filterGenus) {
            return monsters.filter((m) => m.genus === filterGenus);
        }
        return monsters;
    };

    const hasActiveFilter = (relationCriteria === "terrain" && !!filterTerrain) ||
        (relationCriteria === "affiliation" && !!filterAffiliation) ||
        (relationCriteria === "genus" && !!filterGenus);

    const activeFilterLabel = hasActiveFilter
        ? relationCriteria === "terrain" ? filterTerrain
        : relationCriteria === "affiliation" ? filterAffiliation
        : filterGenus
        : null;

    const budget = useMemo(() => {
        return partyBudget({ level: avgLevel, size: partySize, difficulty, ruleset, mode: budgetMode });
    }, [avgLevel, partySize, difficulty, ruleset, budgetMode]);

    const soloSuggestions = useMemo(() => {
        return suggestBossWithMinions({ level: avgLevel, size: partySize, difficulty, ruleset, budget, includeMinions, relationCriteria, catalog });
    }, [avgLevel, partySize, difficulty, ruleset, budget, includeMinions, relationCriteria, catalog]);

    const groupSuggestions = useMemo(() => {
        return suggestGroupEncounters({ level: avgLevel, size: partySize, difficulty, ruleset, budget, maxTypes: groupTypes, relationCriteria, catalog });
    }, [avgLevel, partySize, difficulty, ruleset, budget, groupTypes, relationCriteria, catalog]);

    const primarySolo = soloSuggestions[0];
    const primaryGroup = groupSuggestions[0];

    const formatGroupMembers = (members: { count: number; cr: number }[]) =>
        members.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ");

    const formatBossMinions = (suggestion: { boss: { count: number; cr: number }; minions: { count: number; cr: number }[] }) => {
        const bossStr = `${suggestion.boss.count} × CR ${formatCR(suggestion.boss.cr)} (Boss)`;
        if (suggestion.minions.length === 0) return bossStr;
        const minionStr = suggestion.minions.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ");
        return `${bossStr} + ${minionStr}`;
    };

    const budgetStatus = (fit: number) => {
        if (fit >= 0.95 && fit <= 1.05) return { label: t("onTarget"), color: "text-green-400" };
        if (fit > 1.05) return { label: t("overBudget"), color: "text-crimson" };
        return { label: t("underBudget"), color: "text-amber-400" };
    };

    const primaryFit = mode === "solo" ? primarySolo?.fit : primaryGroup?.fit;
    const primaryStatus = primaryFit !== undefined ? budgetStatus(primaryFit) : null;

    const showRelationControls = mode === "group" || (mode === "solo" && includeMinions);

    return (
        <PageSection>

            {/* ── Header ── */}
            <PageHeader title={t("title")} description={t("description")}>
                <div>
                    <p className="text-xs text-muted">{t("rulesetNote")}</p>
                    <WhyDifferent className="mt-3" />
                </div>
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic">
                    {t("viewDocs")}
                </Link>
            </PageHeader>

            {/* ── 1. Party Setup ── */}
            <Card className="p-6 border-gold/10">
                <SectionHeader>Party</SectionHeader>

                <div className="mb-5">
                    <SubLabel className="mb-3">{t("quickPresets")}</SubLabel>
                    <div className="flex flex-wrap gap-2">
                        {[3, 4, 5, 6].map((size) => (
                            <ToggleChip key={size} isActive={partySize === size} onClick={() => setPartySize(size)}>
                                {size} PCs
                            </ToggleChip>
                        ))}
                        <span className="w-px self-stretch bg-gold/10 mx-1 hidden sm:block" />
                        {[3, 5, 10, 15, 20].map((level) => (
                            <ToggleChip key={level} isActive={avgLevel === level} onClick={() => setAvgLevel(level)}>
                                Lv {level}
                            </ToggleChip>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <FormField label={t("partySize")}>
                        <Input type="number" min={1} max={8} value={partySize}
                               onChange={(e) => setPartySize(+e.target.value)}
                               aria-label="Party size (number of players)" />
                    </FormField>
                    <FormField label={t("avgLevel")}>
                        <Input type="number" min={1} max={20} value={avgLevel}
                               onChange={(e) => setAvgLevel(+e.target.value)}
                               aria-label="Average party level" />
                    </FormField>
                    <FormField label={t("ruleset")}>
                        <Select value={ruleset} onChange={(e) => setRuleset(e.target.value as Ruleset)} aria-label="Ruleset version">
                            <option value="2014">{t("ruleset2014")}</option>
                            <option value="2024">{t("ruleset2024")}</option>
                        </Select>
                    </FormField>
                    <FormField label={t("difficulty")}>
                        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} aria-label="Encounter difficulty">
                            <option value="easy">{t("easy")}</option>
                            <option value="medium">{t("medium")}</option>
                            <option value="hard">{t("hard")}</option>
                            <option value="deadly">{t("deadly")}</option>
                        </Select>
                    </FormField>
                </div>

                <div className="mt-5 pt-4 border-t border-gold/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm uppercase tracking-widest text-muted">
                        {t("totalXPBudget")}:
                        <span className="accent-gold font-bold ml-2 text-lg">{budget.toLocaleString()} XP</span>
                    </span>
                    {primaryStatus && (
                        <FilterBadge active className={primaryStatus.color}>
                            {primaryStatus.label}
                        </FilterBadge>
                    )}
                </div>
            </Card>

            {/* ── 2. Encounter Shape ── */}
            <Card className="p-6 border-gold/10">
                <SectionHeader>Encounter</SectionHeader>

                <div className="mb-5">
                    <SubLabel className="mb-3">{t("formation")}</SubLabel>
                    <div className="flex gap-2">
                        <ToggleChip size="lg" isActive={mode === "solo"} onClick={() => setMode("solo")}
                            className={mode === "solo" ? "shadow-[0_0_10px_rgba(197,160,89,0.3)] font-bold" : ""}>
                            {t("soloBoss")}
                        </ToggleChip>
                        <ToggleChip size="lg" isActive={mode === "group"} onClick={() => setMode("group")}
                            className={mode === "group" ? "shadow-[0_0_10px_rgba(197,160,89,0.3)] font-bold" : ""}>
                            {t("hordeGroup")}
                        </ToggleChip>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    <FormField label={t("budgetType")}>
                        <Select value={budgetMode} onChange={(e) => setBudgetMode(e.target.value as BudgetMode)} aria-label="XP budget type">
                            <option value="encounter">{t("encounterBudget")}</option>
                            <option value="daily">{t("dailyBudget")}</option>
                        </Select>
                    </FormField>

                    {mode === "solo" && (
                        <FormField label={t("includeMinions")}>
                            <Select value={includeMinions ? "yes" : "no"} onChange={(e) => setIncludeMinions(e.target.value === "yes")} aria-label="Include minions with boss">
                                <option value="no">{t("no")}</option>
                                <option value="yes">{t("yes")}</option>
                            </Select>
                        </FormField>
                    )}

                    {mode === "group" && (
                        <FormField label={t("mixTypes")}>
                            <Select value={groupTypes} onChange={(e) => setGroupTypes(Number(e.target.value))} aria-label="Maximum CR types in a group">
                                <option value={2}>2 Types</option>
                                <option value={3}>3 Types</option>
                                <option value={4}>4 Types</option>
                                <option value={5}>5 Types</option>
                            </Select>
                        </FormField>
                    )}
                </div>
            </Card>

            {/* ── 3. Monster Filter ── */}
            {showRelationControls && (
                <MonsterFilterPanel
                    relationCriteria={relationCriteria}
                    onRelationChange={setRelationCriteria}
                    filterTerrain={filterTerrain}
                    onTerrainChange={setFilterTerrain}
                    filterAffiliation={filterAffiliation}
                    onAffiliationChange={setFilterAffiliation}
                    filterGenus={filterGenus}
                    onGenusChange={setFilterGenus}
                    knownGenera={knownGenera}
                />
            )}

            {/* ── 4. Results ── */}
            <Card className="p-6" ref={resultsRef}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gold/10 pb-5 mb-6">
                    <div>
                        <h2 className="font-serif text-2xl accent-gold uppercase tracking-wide">{t("suggestedEncounters")}</h2>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <FilterBadge>{partySize} PCs · Lv {avgLevel}</FilterBadge>
                            <FilterBadge>{difficulty}</FilterBadge>
                            <FilterBadge>{ruleset}</FilterBadge>
                            <FilterBadge>{budgetMode}</FilterBadge>
                            <FilterBadge>{mode === "solo" ? (includeMinions ? "boss + minions" : "solo boss") : `group ≤${groupTypes}`}</FilterBadge>
                            {hasActiveFilter && (
                                <FilterBadge active>{relationCriteria}: {activeFilterLabel}</FilterBadge>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        <span className="text-sm font-medium uppercase tracking-widest">
                            <span className="accent-gold font-bold text-lg">{budget.toLocaleString()} XP</span>
                        </span>
                    </div>
                </div>

                {mode === "solo" && primarySolo && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <SubLabel className="mb-2">{t("recommendedMix")}</SubLabel>
                        <div className="mt-2 font-serif text-lg accent-gold">{formatBossMinions(primarySolo)}</div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primarySolo.fit * 100).toFixed(0)}% · {budgetStatus(primarySolo.fit).label}
                        </div>
                    </div>
                )}
                {mode === "group" && primaryGroup && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <SubLabel className="mb-2">{t("recommendedMix")}</SubLabel>
                        <div className="mt-2 font-serif text-lg accent-gold">{formatGroupMembers(primaryGroup.members)}</div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primaryGroup.fit * 100).toFixed(0)}% · {budgetStatus(primaryGroup.fit).label}
                        </div>
                    </div>
                )}

                <section>
                    <div className="mb-4">
                        <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">{t("crMixOptions")}</h3>
                        <p className="text-xs text-muted mt-1">{t("crMixOptionsNote")}</p>
                    </div>

                    <ul className="grid gap-4">
                        {(mode === "solo" ? soloSuggestions : groupSuggestions).map((suggestion, i) => {
                            const members = mode === "solo"
                                ? [
                                    { cr: (suggestion as typeof soloSuggestions[0]).boss.cr, count: (suggestion as typeof soloSuggestions[0]).boss.count, label: "Boss" },
                                    ...(suggestion as typeof soloSuggestions[0]).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
                                  ]
                                : (suggestion as typeof groupSuggestions[0]).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

                            const uniqueCRs = [...new Set(members.map((m) => m.cr))];
                            const isExpanded = expandedSuggestion === i;

                            return (
                                <li key={i}>
                                    <Card className={`border ${mode === "solo" ? "border-gold/10" : "border-silver/10"} transition-all ${isExpanded ? "shadow-glow border-gold/30" : "hover:border-gold/20"} bg-background/50`}>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSuggestion(isExpanded ? null : i)}
                                            className="w-full p-5 text-left cursor-pointer hover:bg-gold/[0.02] transition-colors rounded-sm"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex flex-wrap items-baseline gap-x-1">
                                                    {members.map((m, idx) => (
                                                        <span key={idx}>
                                                            <span className="font-bold text-xl accent-gold">{m.count}</span>
                                                            <span className="text-muted mx-1 font-sans italic">&times;</span>
                                                            <span className="text-foreground text-lg">CR {formatCR(m.cr)}</span>
                                                            {m.label && <span className="text-muted text-xs ml-1">({m.label})</span>}
                                                            {idx < members.length - 1 && <span className="text-gold/30 mx-2">|</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-muted text-xs font-bold uppercase">{suggestion.adjustedXP.toLocaleString()} XP</span>
                                                    <span className={`text-base text-gold/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▾</span>
                                                </div>
                                            </div>
                                            <div className={`mt-1 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(suggestion.fit).color}`}>
                                                {budgetStatus(suggestion.fit).label} · {(suggestion.fit * 100).toFixed(0)}%
                                            </div>
                                            <BudgetBar fit={suggestion.fit} budgetFitLabel={t("budgetFit")} accent={mode === "solo" ? "gold" : "silver"} />
                                        </button>

                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-1 border-t border-gold/10 grid gap-3">
                                                {uniqueCRs.map((cr) => {
                                                    const allMonsters = getMonstersForCR(cr, ruleset, catalog);
                                                    const monsters = filterMonsterPool(allMonsters);
                                                    const slot = members.find((m) => m.cr === cr);
                                                    const filtered = hasActiveFilter && monsters.length < allMonsters.length;
                                                    return (
                                                        <div key={cr}>
                                                            <SubLabel className="mb-1.5">
                                                                CR {formatCR(cr)} {slot?.label ? `(${slot.label})` : ""}
                                                                {" — "}
                                                                {monsters.length} available
                                                                {filtered && <span className="text-gold/40 ml-1">({allMonsters.length} total)</span>}
                                                            </SubLabel>
                                                            {monsters.length === 0 ? (
                                                                <p className="text-muted text-xs italic">No monsters match the current filter at this CR.</p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {monsters.map((m) => (
                                                                        <span
                                                                            key={m.name}
                                                                            className={`inline-flex items-center px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                                                                                m.source === "homebrew"
                                                                                    ? "border-gold/30 bg-gold/10 text-gold"
                                                                                    : "border-gold/10 bg-gold/5 text-foreground"
                                                                            }`}
                                                                            title={`${m.name} — ${m.affiliation}${m.genus ? `, ${m.genus}` : ""}${m.terrain?.length ? ` · ${m.terrain.join(", ")}` : ""}`}
                                                                        >
                                                                            {m.name}
                                                                            {m.source === "homebrew" && <span className="ml-1 text-[9px] text-gold/60">★</span>}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </Card>

            <p className="text-xs text-muted italic text-center">{t("calculationsNote")}</p>

            <div className="hidden lg:block pt-4">
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic inline-flex justify-center w-full">
                    {t("viewDocs")}
                </Link>
            </div>
        </PageSection>
    );
}
