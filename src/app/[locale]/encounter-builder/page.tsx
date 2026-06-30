"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { SliderToggle } from "@/app/components/atoms/SliderToggle";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";

type Mode = "solo" | "group";
type Difficulty = "easy" | "medium" | "hard" | "deadly";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

function EncounterModal({
    suggestion,
    mode,
    ruleset,
    catalog,
    filterMonsterPool,
    hasActiveFilter,
    onClose,
}: {
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: Mode;
    ruleset: Ruleset;
    catalog: readonly Monster[];
    filterMonsterPool: (monsters: Monster[]) => Monster[];
    hasActiveFilter: boolean;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!suggestion) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [suggestion, onClose]);

    if (!suggestion) return null;

    const members = mode === "solo"
        ? [
            { cr: (suggestion as BossMinionSuggestion).boss.cr, count: (suggestion as BossMinionSuggestion).boss.count, label: "Boss" },
            ...(suggestion as BossMinionSuggestion).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
          ]
        : (suggestion as GroupSuggestion).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

    const uniqueCRs = [...new Set(members.map((m) => m.cr))];

    const modal = (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    key="panel"
                    className="relative z-10 w-full max-w-lg bg-card border border-gold/20 rounded-sm shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 24 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {/* Header */}
                    <div data-testid="encounter-modal" className="flex justify-between items-start gap-3 p-5 border-b border-gold/10">
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
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-muted hover:text-foreground transition-colors text-lg leading-none shrink-0 mt-0.5"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 grid gap-3 max-h-[60vh] overflow-y-auto">
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

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
    const searchParams = useSearchParams();

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
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ps = searchParams.get("partySize");
        const al = searchParams.get("avgLevel");
        const diff = searchParams.get("difficulty") as Difficulty | null;
        const md = searchParams.get("mode") as Mode | null;
        const ft = searchParams.get("filterTerrain") as Terrain | null;
        const rel = searchParams.get("relation") as RelationCriteria | null;
        if (ps) setPartySize(Number(ps));
        if (al) setAvgLevel(Number(al));
        if (diff && ["easy", "medium", "hard", "deadly"].includes(diff)) setDifficulty(diff);
        if (md && ["solo", "group"].includes(md)) setMode(md);
        if (ft) setFilterTerrain(ft);
        if (rel && ["any", "terrain", "affiliation", "genus"].includes(rel)) setRelationCriteria(rel);
    }, [searchParams]);
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

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    <FormField label={t("formation")}>
                        <SliderToggle
                            value={mode}
                            onChange={setMode}
                            options={[
                                {
                                    value: "solo" as Mode,
                                    title: t("soloBoss"),
                                    icon: (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z"/>
                                        </svg>
                                    ),
                                },
                                {
                                    value: "group" as Mode,
                                    title: t("hordeGroup"),
                                    icon: (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="8" r="3"/>
                                            <circle cx="17" cy="10" r="2.5"/>
                                            <circle cx="4" cy="13" r="2"/>
                                            <path d="M3 20 Q6 16 9 16 Q12 16 15 20"/>
                                            <path d="M13 20 Q15 17 17 17 Q19 17 21 20"/>
                                        </svg>
                                    ),
                                },
                            ]}
                        />
                    </FormField>

                    <FormField label={t("budgetType")}>
                        <SliderToggle
                            value={budgetMode}
                            onChange={setBudgetMode}
                            options={[
                                {
                                    value: "encounter" as BudgetMode,
                                    title: t("encounterBudget"),
                                    icon: (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 3 L21 21 M3 3 L8 3 L3 8 M21 21 L21 16 L16 21"/>
                                            <path d="M21 3 L3 21 M21 3 L16 3 L21 8 M3 21 L3 16 L8 21"/>
                                        </svg>
                                    ),
                                },
                                {
                                    value: "daily" as BudgetMode,
                                    title: t("dailyBudget"),
                                    icon: (
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="4"/>
                                            <line x1="12" y1="2" x2="12" y2="5"/>
                                            <line x1="12" y1="19" x2="12" y2="22"/>
                                            <line x1="2" y1="12" x2="5" y2="12"/>
                                            <line x1="19" y1="12" x2="22" y2="12"/>
                                            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/>
                                            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
                                            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/>
                                            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/>
                                        </svg>
                                    ),
                                },
                            ]}
                        />
                    </FormField>

                    {mode === "solo" && (
                        <FormField label={t("includeMinions")}>
                            <SliderToggle
                                value={includeMinions ? "yes" : "no"}
                                onChange={(v) => setIncludeMinions(v === "yes")}
                                options={[
                                    {
                                        value: "no" as const,
                                        title: t("no"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="8" r="4"/>
                                                <path d="M4 20 Q8 14 12 14 Q16 14 20 20"/>
                                            </svg>
                                        ),
                                    },
                                    {
                                        value: "yes" as const,
                                        title: t("yes"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="8" r="3.5"/>
                                                <path d="M2 20 Q5.5 15 9 15 Q12.5 15 16 20"/>
                                                <circle cx="18" cy="10" r="2.5"/>
                                                <path d="M14 20 Q16 17 18 17 Q20 17 22 20"/>
                                            </svg>
                                        ),
                                    },
                                ]}
                            />
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

                    <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                        {(mode === "solo" ? soloSuggestions : groupSuggestions).map((suggestion, i) => {
                            const members = mode === "solo"
                                ? [
                                    { cr: (suggestion as typeof soloSuggestions[0]).boss.cr, count: (suggestion as typeof soloSuggestions[0]).boss.count, label: "Boss" },
                                    ...(suggestion as typeof soloSuggestions[0]).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
                                  ]
                                : (suggestion as typeof groupSuggestions[0]).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

                            return (
                                <li key={i} data-testid="suggestion-card">
                                    <Card className={`border ${mode === "solo" ? "border-gold/10" : "border-silver/10"} transition-all hover:border-gold/20 bg-background/50`}>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSuggestion(i)}
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
                                                    <span className="text-[10px] text-gold/40 uppercase tracking-widest hidden sm:inline">Monsters ›</span>
                                                </div>
                                            </div>
                                            <div className={`mt-1 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(suggestion.fit).color}`}>
                                                {budgetStatus(suggestion.fit).label} · {(suggestion.fit * 100).toFixed(0)}%
                                            </div>
                                            <BudgetBar fit={suggestion.fit} budgetFitLabel={t("budgetFit")} accent={mode === "solo" ? "gold" : "silver"} />
                                        </button>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>

                    <EncounterModal
                        suggestion={expandedSuggestion !== null ? (mode === "solo" ? soloSuggestions : groupSuggestions)[expandedSuggestion] : null}
                        mode={mode}
                        ruleset={ruleset}
                        catalog={catalog}
                        filterMonsterPool={filterMonsterPool}
                        hasActiveFilter={hasActiveFilter}
                        onClose={() => setExpandedSuggestion(null)}
                    />
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
