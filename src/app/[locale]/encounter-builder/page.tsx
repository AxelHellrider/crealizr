"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {useLocale, useTranslations} from 'next-intl';
import {
    partyBudget,
    suggestEncounters,
    suggestGroupEncounters,
} from "@/app/utils/encounter";
import { formatCR } from "@/app/lib/format";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";

type Mode = "solo" | "group";
type Difficulty = "easy" | "medium" | "hard" | "deadly";
type Ruleset = "2014" | "2024";
type BudgetMode = "encounter" | "daily";

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
    const resultsRef = useRef<HTMLDivElement>(null);

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
            maxTypes: groupTypes,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budget, groupTypes]);

    const partyPresets = [
        { label: "3 PCs", size: 3 },
        { label: "4 PCs", size: 4 },
        { label: "5 PCs", size: 5 },
        { label: "6 PCs", size: 6 },
    ];

    const levelPresets = [
        { label: "Lv 3", level: 3 },
        { label: "Lv 5", level: 5 },
        { label: "Lv 10", level: 10 },
        { label: "Lv 15", level: 15 },
    ];

    const primarySolo = soloSuggestions[0];
    const primaryGroup = groupSuggestions[0];
    const formatGroupMembers = (members: { count: number; cr: number }[]) =>
        members.map((m) => `${m.count} × CR ${formatCR(m.cr)}`).join(", ");
    const budgetStatus = (fit: number) => {
        if (fit >= 0.95 && fit <= 1.05) return { label: t("onTarget"), color: "text-green-400" };
        if (fit > 1.05) return { label: t("overBudget"), color: "text-crimson" };
        return { label: t("underBudget"), color: "text-amber-400" };
    };
    const primaryFit = mode === "solo" ? primarySolo?.fit : primaryGroup?.fit;
    const primaryStatus = primaryFit !== undefined ? budgetStatus(primaryFit) : null;

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section className="grid gap-8 glass-panel p-5 lg:p-12 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">
            <header className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                <div>
                    <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">{t("title")}</h1>
                    <p className="text-muted mt-2 font-light italic">
                        {t("description")}
                    </p>
                    <p className="text-xs text-muted mt-2">{t("rulesetNote")}</p>
                    <WhyDifferent className="mt-3" />
                </div>
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic hidden lg:inline-flex">
                    {t("viewDocs")}
                </Link>
            </header>

            <Card className="p-6 border-gold/10">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("quickPresets")}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {partyPresets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    onClick={() => setPartySize(preset.size)}
                                    className="px-3 py-2 text-xs uppercase tracking-widest"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {levelPresets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    onClick={() => setAvgLevel(preset.level)}
                                    className="px-3 py-2 text-xs uppercase tracking-widest"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        {t("budgetMath")}
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <FormField label={t("partySize")}>
                    <Input type="number" min={1} max={8}
                           value={partySize}
                           onChange={(e) => setPartySize(+e.target.value)}
                           aria-label="Party size (number of players)"
                    />
                </FormField>

                <FormField label={t("avgLevel")}>
                    <Input type="number" min={1} max={20}
                           value={avgLevel}
                           onChange={(e) => setAvgLevel(+e.target.value)}
                           aria-label="Average party level"
                    />
                </FormField>

                <FormField label={t("ruleset")}>
                    <Select value={ruleset}
                            onChange={(e) => setRuleset(e.target.value as Ruleset)}
                            aria-label="Ruleset version">
                        <option value="2014">{t("ruleset2014")}</option>
                        <option value="2024">{t("ruleset2024")}</option>
                    </Select>
                </FormField>

                <FormField label={t("difficulty")}>
                    <Select value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            aria-label="Encounter difficulty">
                        <option value="easy">{t("easy")}</option>
                        <option value="medium">{t("medium")}</option>
                        <option value="hard">{t("hard")}</option>
                        <option value="deadly">{t("deadly")}</option>
                    </Select>
                </FormField>

                <FormField label={t("budgetType")}>
                    <Select value={budgetMode}
                            onChange={(e) => setBudgetMode(e.target.value as BudgetMode)}
                            aria-label="XP budget type">
                        <option value="encounter">{t("encounterBudget")}</option>
                        <option value="daily">{t("dailyBudget")}</option>
                    </Select>
                </FormField>

                <FormField label={t("formation")}>
                    <Select value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}
                            aria-label="Encounter type mode">
                        <option value="solo">{t("soloBoss")}</option>
                        <option value="group">{t("hordeGroup")}</option>
                    </Select>
                </FormField>

                {mode === "group" && (
                    <FormField label={t("mixTypes")}>
                        <Select
                            value={groupTypes}
                            onChange={(e) => setGroupTypes(Number(e.target.value))}
                            aria-label="Maximum CR types in a group"
                        >
                            <option value={2}>2 Types</option>
                            <option value={3}>3 Types</option>
                            <option value={4}>4 Types</option>
                            <option value={5}>5 Types</option>
                        </Select>
                    </FormField>
                )}
            </div>

            <Button
                variant="primary"
                onClick={scrollToResults}
                className="w-full lg:w-auto px-10 py-3 uppercase tracking-widest font-serif"
            >
                {t("showSuggestions")}
            </Button>

            {/* Results */}
            <Card className="p-6" ref={resultsRef}>
                <div className="flex flex-col lg:flex-row lg:justify-between mb-8 border-b border-gold/10 pb-4">
                    <h2 className="font-serif text-2xl accent-gold uppercase tracking-wide">{t("suggestedEncounters")}</h2>
                    <div className="text-sm font-medium mt-2 lg:mt-0 uppercase tracking-widest flex flex-col lg:items-end gap-2">
                        <span>
                            {t("totalXPBudget")}: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span>
                        </span>
                        {primaryStatus && (
                            <span className={`text-[10px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest border border-gold/20 ${primaryStatus.color}`}>
                                {t("budgetStatus")}: {primaryStatus.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold text-gold/70">
                    <span className="border border-gold/20 px-3 py-1">Party {partySize}</span>
                    <span className="border border-gold/20 px-3 py-1">Level {avgLevel}</span>
                    <span className="border border-gold/20 px-3 py-1">{difficulty}</span>
                    <span className="border border-gold/20 px-3 py-1">{ruleset} ruleset</span>
                    <span className="border border-gold/20 px-3 py-1">{budgetMode} budget</span>
                    {mode === "group" && (
                        <span className="border border-gold/20 px-3 py-1">up to {groupTypes} types</span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">
                    <span>{t("exportPreview")}</span>
                    <span className="text-muted normal-case tracking-normal">{t("exportSnapshot")}</span>
                </div>

                {mode === "solo" && primarySolo && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("recommendedMix")}</div>
                        <div className="mt-2 font-serif text-lg accent-gold">
                            {`${primarySolo.count} × CR ${formatCR(primarySolo.cr)}`}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primarySolo.fit * 100).toFixed(0)}% · {budgetStatus(primarySolo.fit).label}
                        </div>
                    </div>
                )}
                {mode === "group" && primaryGroup && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("recommendedMix")}</div>
                        <div className="mt-2 font-serif text-lg accent-gold">
                            {formatGroupMembers(primaryGroup.members)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primaryGroup.fit * 100).toFixed(0)}% · {budgetStatus(primaryGroup.fit).label}
                        </div>
                    </div>
                )}

                {mode === "solo" ? (
                    <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                        {soloSuggestions.map((s, i) => (
                            <li key={i}>
                                <Card className="p-6 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-glow bg-bg/50">
                                    <div className="flex justify-between items-start">
                                        <div className="font-serif text-xl accent-gold">{s.count} &times; CR {formatCR(s.cr)}</div>
                                        <div className="text-muted text-xs font-bold uppercase">{s.adjustedXP} XP</div>
                                    </div>
                                    <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(s.fit).color}`}>
                                        {budgetStatus(s.fit).label}
                                    </div>
                                    <div className="mt-4 h-1 w-full bg-gold/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]" style={{ width: `${s.fit * 100}%` }} />
                                    </div>
                                    <div className="mt-2 text-right text-[10px] text-gold/60 uppercase tracking-widest font-bold">
                                        {t("budgetFit")} {(s.fit * 100).toFixed(0)}%
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {groupSuggestions.map((g, i) => (
                            <li key={i}>
                                <Card className="p-6 border border-silver/10 hover:border-silver/30 transition-all hover:shadow-glow bg-bg/50">
                                    <div className="flex justify-between items-start">
                                        <div className="font-serif">
                                            {g.members.map((m, idx) => (
                                                <span key={idx}>
                                                    <span className="font-bold text-xl accent-gold">{m.count}</span>
                                                    <span className="text-muted mx-1 font-sans italic">&times;</span>
                                                    <span className="text-foreground text-lg">CR {formatCR(m.cr)}</span>
                                                    {idx < g.members.length - 1 && <span className="text-gold/30 mx-3">|</span>}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-muted text-xs font-bold uppercase ml-4">{g.adjustedXP} XP</div>
                                    </div>
                                    <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(g.fit).color}`}>
                                        {budgetStatus(g.fit).label}
                                    </div>
                                    <div className="mt-4 h-1 w-full bg-silver/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" style={{ width: `${g.fit * 100}%` }} />
                                    </div>
                                    <div className="mt-2 text-right text-[10px] text-silver/60 uppercase tracking-widest font-bold">
                                        {t("budgetFit")} {(g.fit * 100).toFixed(0)}%
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <p className="text-xs text-muted italic text-center">
                {t("calculationsNote")}
            </p>

            <div className="hidden lg:block pt-4">
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic inline-flex justify-center w-full">
                    {t("viewDocs")}
                </Link>
            </div>
        </section>
    );
}
