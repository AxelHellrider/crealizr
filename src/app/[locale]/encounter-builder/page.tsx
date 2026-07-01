"use client";

import { useMemo, useState, useEffect } from "react";
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
import { EncounterHexMap } from "@/app/components/organisms/EncounterHexMap";
import { Card } from "@/app/components/atoms/Card";
import { SliderToggle } from "@/app/components/atoms/SliderToggle";
import type { GroupSuggestion, BossMinionSuggestion } from "@/app/utils/encounter";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";

type Mode = "solo" | "group";
type Difficulty = "easy" | "medium" | "hard" | "deadly";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

function EncounterModal({
    suggestion, mode, ruleset, catalog, filterMonsterPool, hasActiveFilter, onClose,
}: {
    suggestion: GroupSuggestion | BossMinionSuggestion | null;
    mode: Mode; ruleset: Ruleset; catalog: readonly Monster[];
    filterMonsterPool: (monsters: Monster[]) => Monster[];
    hasActiveFilter: boolean; onClose: () => void;
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                        <button type="button" onClick={onClose}
                            className="text-muted hover:text-foreground transition-colors text-lg leading-none shrink-0 mt-0.5"
                            aria-label="Close">✕</button>
                    </div>
                    <div className="p-5 grid gap-3 max-h-[60vh] overflow-y-auto">
                        {uniqueCRs.map((cr) => {
                            const allMonsters = getMonstersForCR(cr, ruleset, catalog);
                            const monsters = filterMonsterPool(allMonsters);
                            const slot = members.find((m) => m.cr === cr);
                            const filtered = hasActiveFilter && monsters.length < allMonsters.length;
                            return (
                                <div key={cr}>
                                    <SubLabel className="mb-1.5">
                                        CR {formatCR(cr)} {slot?.label ? `(${slot.label})` : ""}{" — "}
                                        {monsters.length} available
                                        {filtered && <span className="text-gold/40 ml-1">({allMonsters.length} total)</span>}
                                    </SubLabel>
                                    {monsters.length === 0 ? (
                                        <p className="text-muted text-xs italic">No monsters match the current filter at this CR.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {monsters.map((m) => (
                                                <span key={m.name}
                                                    className={`inline-flex items-center px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                                                        m.source === "homebrew"
                                                            ? "border-gold/30 bg-gold/10 text-gold"
                                                            : "border-gold/10 bg-gold/5 text-foreground"
                                                    }`}
                                                    title={`${m.name} — ${m.affiliation}${m.genus ? `, ${m.genus}` : ""}${m.terrain?.length ? ` · ${m.terrain.join(", ")}` : ""}`}>
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

function BudgetBar({ fit, accent = "gold" }: { fit: number; accent?: "gold" | "silver" }) {
    return (
        <div className={`mt-2.5 h-px w-full ${accent === "silver" ? "bg-silver/10" : "bg-gold/10"} rounded-full overflow-hidden`}>
            <div
                className={`h-full ${accent === "silver" ? "bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" : "bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]"}`}
                style={{ width: `${Math.min(fit * 100, 100)}%` }}
            />
        </div>
    );
}

export default function CombatBalancerPage() {
    const locale = useLocale();
    const t = useTranslations("encounterBuilder");
    const searchParams = useSearchParams();

    const [partySize, setPartySize] = useState(() => {
        const v = searchParams.get("partySize");
        return v ? Number(v) : 4;
    });
    const [avgLevel, setAvgLevel] = useState(() => {
        const v = searchParams.get("avgLevel");
        return v ? Number(v) : 5;
    });
    const [difficulty, setDifficulty] = useState<Difficulty>(() => {
        const v = searchParams.get("difficulty") as Difficulty | null;
        return v && ["easy", "medium", "hard", "deadly"].includes(v) ? v : "medium";
    });
    const [mode, setMode] = useState<Mode>(() => {
        const v = searchParams.get("mode") as Mode | null;
        return v && ["solo", "group"].includes(v) ? v : "solo";
    });
    const [ruleset, setRuleset] = useState<Ruleset>("2014");
    const [budgetMode, setBudgetMode] = useState<BudgetMode>("encounter");
    const [groupTypes, setGroupTypes] = useState(2);
    const [includeMinions, setIncludeMinions] = useState(false);
    const [relationCriteria, setRelationCriteria] = useState<RelationCriteria>(() => {
        const v = searchParams.get("relation") as RelationCriteria | null;
        return v && ["any", "terrain", "affiliation", "genus"].includes(v) ? v : "any";
    });
    const [filterTerrain, setFilterTerrain] = useState<Terrain | "">(() => {
        return (searchParams.get("filterTerrain") as Terrain | null) ?? "";
    });
    const [filterAffiliation, setFilterAffiliation] = useState<Affiliation | "">("");
    const [filterGenus, setFilterGenus] = useState("");
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(0);

    // Lock body scroll on desktop only — mobile uses the normal stacked layout
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const apply = (matches: boolean) => {
            document.body.style.overflow = matches ? "hidden" : "";
        };
        apply(mq.matches);
        mq.addEventListener("change", (e) => apply(e.matches));
        return () => {
            mq.removeEventListener("change", (e) => apply(e.matches));
            document.body.style.overflow = "";
        };
    }, []);

    const { catalog2014, catalog2024 } = useMergedCatalog();
    const catalog = ruleset === "2024" ? catalog2024 : catalog2014;

    const knownGenera = useMemo(
        () => [...new Set(catalog.map((m) => m.genus).filter(Boolean) as string[])].sort(),
        [catalog]
    );

    const filterMonsterPool = (monsters: Monster[]): Monster[] => {
        if (relationCriteria === "terrain" && filterTerrain)
            return monsters.filter((m) => m.terrain.includes(filterTerrain) || m.terrain.includes("any"));
        if (relationCriteria === "affiliation" && filterAffiliation)
            return monsters.filter((m) => m.affiliation === filterAffiliation || m.affiliation === "any");
        if (relationCriteria === "genus" && filterGenus)
            return monsters.filter((m) => m.genus === filterGenus);
        return monsters;
    };

    const hasActiveFilter =
        (relationCriteria === "terrain" && !!filterTerrain) ||
        (relationCriteria === "affiliation" && !!filterAffiliation) ||
        (relationCriteria === "genus" && !!filterGenus);

    const activeFilterLabel = hasActiveFilter
        ? relationCriteria === "terrain" ? filterTerrain
        : relationCriteria === "affiliation" ? filterAffiliation
        : filterGenus
        : null;

    const budget = useMemo(
        () => partyBudget({ level: avgLevel, size: partySize, difficulty, ruleset, mode: budgetMode }),
        [avgLevel, partySize, difficulty, ruleset, budgetMode]
    );

    const soloSuggestions = useMemo(
        () => suggestBossWithMinions({ level: avgLevel, size: partySize, difficulty, ruleset, budget, includeMinions, relationCriteria, catalog }),
        [avgLevel, partySize, difficulty, ruleset, budget, includeMinions, relationCriteria, catalog]
    );

    const groupSuggestions = useMemo(
        () => suggestGroupEncounters({ level: avgLevel, size: partySize, difficulty, ruleset, budget, maxTypes: groupTypes, relationCriteria, catalog }),
        [avgLevel, partySize, difficulty, ruleset, budget, groupTypes, relationCriteria, catalog]
    );

    const suggestions = mode === "solo" ? soloSuggestions : groupSuggestions;
    const safeSelectedIdx = Math.min(selectedIdx, Math.max(0, suggestions.length - 1));
    const mapSuggestion = suggestions[safeSelectedIdx] ?? null;

    const formatGroupMembers = (members: { count: number; cr: number }[]) =>
        members.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ");

    const formatBossMinions = (s: { boss: { count: number; cr: number }; minions: { count: number; cr: number }[] }) => {
        const b = `${s.boss.count} × CR ${formatCR(s.boss.cr)} (Boss)`;
        return s.minions.length ? `${b} + ${s.minions.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ")}` : b;
    };

    const budgetStatus = (fit: number) => {
        if (fit >= 0.95 && fit <= 1.05) return { label: t("onTarget"), color: "text-green-400" };
        if (fit > 1.05) return { label: t("overBudget"), color: "text-crimson" };
        return { label: t("underBudget"), color: "text-amber-400" };
    };

    const primaryFit = mapSuggestion?.fit;
    const primaryStatus = primaryFit !== undefined ? budgetStatus(primaryFit) : null;
    const showRelationControls = mode === "group" || (mode === "solo" && includeMinions);

    return (
        /* Full-height section that fills the rest of the viewport */
        <section className="glass-panel fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0 flex flex-col lg:h-[calc(100dvh-3.5rem)] xl:h-dvh lg:overflow-hidden">

            {/* ── Page header (fixed height) ── */}
            <div className="shrink-0 p-4 lg:px-8 lg:pt-8 lg:pb-6">
                <PageHeader title={t("title")} description={t("description")}>
                    <div>
                        <p className="text-xs text-muted">{t("rulesetNote")}</p>
                        <WhyDifferent className="mt-3" />
                    </div>
                    <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic">
                        {t("viewDocs")}
                    </Link>
                </PageHeader>
            </div>

            {/* ── 3-column body (fills remaining height) ── */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(252px,1fr)_minmax(320px,1.6fr)_minmax(252px,1fr)] gap-6 p-4 lg:px-8 lg:pb-8">

                {/* ── LEFT: Party Options ── */}
                <div className="min-h-0 flex flex-col gap-4 lg:overflow-y-auto">
                    <Card className="p-6 border-gold/10 shrink-0">
                        <SectionHeader>Party</SectionHeader>

                        <div className="mb-5">
                            <SubLabel className="mb-3">{t("quickPresets")}</SubLabel>
                            <div className="flex flex-wrap gap-2">
                                {[3, 4, 5, 6].map((size) => (
                                    <ToggleChip key={size} isActive={partySize === size} onClick={() => setPartySize(size)}>
                                        {size} PCs
                                    </ToggleChip>
                                ))}
                                <span className="w-px self-stretch bg-gold/10 mx-1" />
                                {[3, 5, 10, 15, 20].map((level) => (
                                    <ToggleChip key={level} isActive={avgLevel === level} onClick={() => setAvgLevel(level)}>
                                        Lv {level}
                                    </ToggleChip>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 grid-cols-2">
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

                        <div className="mt-5 pt-4 border-t border-gold/10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs uppercase tracking-widest text-muted">{t("totalXPBudget")}</span>
                                <span className="accent-gold font-bold text-xl">{budget.toLocaleString()} XP</span>
                            </div>
                            {primaryStatus && (
                                <div className="mt-2">
                                    <FilterBadge active className={primaryStatus.color}>
                                        {primaryStatus.label}
                                    </FilterBadge>
                                </div>
                            )}
                        </div>
                    </Card>

                    <p className="text-xs text-muted italic text-center shrink-0 pb-2">{t("calculationsNote")}</p>
                </div>

                {/* ── MIDDLE: Battlefield map ── */}
                <div className="min-h-0 flex flex-col lg:overflow-hidden">
                    <Card className="flex-1 flex flex-col p-5 border-gold/10 min-h-0">
                        <SectionHeader className="mb-3! shrink-0">Battlefield</SectionHeader>

                        {/* Hex map fills remaining card space */}
                        <EncounterHexMap partySize={partySize} suggestion={mapSuggestion} mode={mode} />

                        {/* Callout: selected encounter summary */}
                        {mapSuggestion && (
                            <div className="shrink-0 mt-3 rounded-sm border border-gold/15 bg-gold/[0.03] p-3">
                                <SubLabel className="mb-1">{t("recommendedMix")}</SubLabel>
                                <div className="mt-1 font-serif text-sm accent-gold leading-snug">
                                    {mode === "solo"
                                        ? formatBossMinions(mapSuggestion as BossMinionSuggestion)
                                        : formatGroupMembers((mapSuggestion as GroupSuggestion).members)}
                                </div>
                                {primaryStatus && (
                                    <div className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${primaryStatus.color}`}>
                                        {primaryStatus.label} · {(mapSuggestion.fit * 100).toFixed(0)}%
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── RIGHT: Encounter Options + Suggestions ── */}
                <div className="min-h-0 flex flex-col gap-4 lg:overflow-y-auto">

                    {/* Encounter shape */}
                    <Card className="p-6 border-gold/10 shrink-0">
                        <SectionHeader>Encounter</SectionHeader>
                        <div className="flex flex-col gap-4">
                            <FormField label={t("formation")}>
                                <SliderToggle value={mode} onChange={setMode} options={[
                                    {
                                        value: "solo" as Mode, title: t("soloBoss"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z"/>
                                            </svg>
                                        ),
                                    },
                                    {
                                        value: "group" as Mode, title: t("hordeGroup"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><circle cx="4" cy="13" r="2"/>
                                                <path d="M3 20 Q6 16 9 16 Q12 16 15 20"/><path d="M13 20 Q15 17 17 17 Q19 17 21 20"/>
                                            </svg>
                                        ),
                                    },
                                ]} />
                            </FormField>

                            <FormField label={t("budgetType")}>
                                <SliderToggle value={budgetMode} onChange={setBudgetMode} options={[
                                    {
                                        value: "encounter" as BudgetMode, title: t("encounterBudget"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 3 L21 21 M3 3 L8 3 L3 8 M21 21 L21 16 L16 21"/>
                                                <path d="M21 3 L3 21 M21 3 L16 3 L21 8 M3 21 L3 16 L8 21"/>
                                            </svg>
                                        ),
                                    },
                                    {
                                        value: "daily" as BudgetMode, title: t("dailyBudget"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="4"/>
                                                <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                                                <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                                                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
                                                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/>
                                            </svg>
                                        ),
                                    },
                                ]} />
                            </FormField>

                            {mode === "solo" && (
                                <FormField label={t("includeMinions")}>
                                    <SliderToggle
                                        value={includeMinions ? "yes" : "no"}
                                        onChange={(v) => setIncludeMinions(v === "yes")}
                                        options={[
                                            {
                                                value: "no" as const, title: t("no"),
                                                icon: (
                                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="8" r="4"/><path d="M4 20 Q8 14 12 14 Q16 14 20 20"/>
                                                    </svg>
                                                ),
                                            },
                                            {
                                                value: "yes" as const, title: t("yes"),
                                                icon: (
                                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="9" cy="8" r="3.5"/><path d="M2 20 Q5.5 15 9 15 Q12.5 15 16 20"/>
                                                        <circle cx="18" cy="10" r="2.5"/><path d="M14 20 Q16 17 18 17 Q20 17 22 20"/>
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

                    {showRelationControls && (
                        <div className="shrink-0">
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
                        </div>
                    )}

                    {/* Suggestions */}
                    <Card className="p-5 shrink-0">
                        <div className="flex items-baseline justify-between gap-2 mb-3">
                            <h2 className="font-serif text-lg accent-gold uppercase tracking-wide">{t("suggestedEncounters")}</h2>
                            <span className="text-xs font-bold accent-gold shrink-0">{budget.toLocaleString()} XP</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                            <FilterBadge>{partySize} PCs · Lv {avgLevel}</FilterBadge>
                            <FilterBadge>{difficulty}</FilterBadge>
                            <FilterBadge>{ruleset}</FilterBadge>
                            <FilterBadge>{budgetMode}</FilterBadge>
                            {hasActiveFilter && (
                                <FilterBadge active>{relationCriteria}: {activeFilterLabel}</FilterBadge>
                            )}
                        </div>

                        <ul className="flex flex-col gap-2">
                            {suggestions.map((suggestion, i) => {
                                const members = mode === "solo"
                                    ? [
                                        { cr: (suggestion as BossMinionSuggestion).boss.cr, count: (suggestion as BossMinionSuggestion).boss.count, label: "Boss" },
                                        ...(suggestion as BossMinionSuggestion).minions.map((m) => ({ cr: m.cr, count: m.count, label: "Minion" })),
                                      ]
                                    : (suggestion as GroupSuggestion).members.map((m) => ({ cr: m.cr, count: m.count, label: undefined as string | undefined }));

                                const isSelected = safeSelectedIdx === i;

                                return (
                                    <li key={i} data-testid="suggestion-card">
                                        {/* div wrapper — avoids nested <button> which is invalid HTML */}
                                        <Card
                                            className={`border transition-all duration-150 cursor-pointer ${
                                                isSelected
                                                    ? (mode === "solo" ? "border-gold/50 bg-gold/6" : "border-silver/50 bg-silver/4")
                                                    : (mode === "solo" ? "border-gold/10 bg-background/50" : "border-silver/10 bg-background/50")
                                            }`}
                                            onClick={() => setSelectedIdx(i)}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={isSelected}
                                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedIdx(i); }}
                                        >
                                            <div className="p-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex flex-wrap items-baseline gap-x-1 flex-1">
                                                        {members.map((m, idx) => (
                                                            <span key={idx}>
                                                                <span className="font-bold text-base accent-gold">{m.count}</span>
                                                                <span className="text-muted mx-1 font-sans italic text-sm">&times;</span>
                                                                <span className="text-foreground text-sm">CR {formatCR(m.cr)}</span>
                                                                {m.label && <span className="text-muted text-[10px] ml-0.5">({m.label})</span>}
                                                                {idx < members.length - 1 && <span className="text-gold/30 mx-1.5">|</span>}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-1.5">
                                                        <span className="text-muted text-[10px] font-bold uppercase">{suggestion.adjustedXP.toLocaleString()} XP</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setExpandedSuggestion(i); }}
                                                            className="text-[10px] text-gold/40 hover:text-gold transition-colors uppercase tracking-widest px-1 py-0.5 border border-gold/10 hover:border-gold/30 rounded-sm"
                                                            aria-label="View monster options"
                                                        >
                                                            Monsters
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={`mt-0.5 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(suggestion.fit).color}`}>
                                                    {budgetStatus(suggestion.fit).label} · {(suggestion.fit * 100).toFixed(0)}%
                                                </div>
                                                <BudgetBar fit={suggestion.fit} accent={mode === "solo" ? "gold" : "silver"} />
                                            </div>
                                        </Card>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>

                    <div className="shrink-0 pb-2">
                        <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-xs italic">
                            {t("viewDocs")}
                        </Link>
                    </div>
                </div>
            </div>

            <EncounterModal
                suggestion={expandedSuggestion !== null ? suggestions[expandedSuggestion] : null}
                mode={mode}
                ruleset={ruleset}
                catalog={catalog}
                filterMonsterPool={filterMonsterPool}
                hasActiveFilter={hasActiveFilter}
                onClose={() => setExpandedSuggestion(null)}
            />
        </section>
    );
}
