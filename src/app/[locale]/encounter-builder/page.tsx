"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
    partyBudget,
    recommendMonstersForParty,
    suggestGroupEncounters,
    suggestBossWithMinions,
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
type RelationCriteria = "terrain" | "affiliation" | "genus" | "any";
type MonsterRecommendationMember = { count: number; name: string; cr: number };

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
    const [isExporting, setIsExporting] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    const budget = useMemo(() => {
        return partyBudget({ level: avgLevel, size: partySize, difficulty, ruleset, mode: budgetMode });
    }, [avgLevel, partySize, difficulty, ruleset, budgetMode]);

    const soloSuggestions = useMemo(() => {
        return suggestBossWithMinions({ level: avgLevel, size: partySize, difficulty, ruleset, budget, includeMinions, relationCriteria });
    }, [avgLevel, partySize, difficulty, ruleset, budget, includeMinions, relationCriteria]);

    const groupSuggestions = useMemo(() => {
        return suggestGroupEncounters({ level: avgLevel, size: partySize, difficulty, ruleset, budget, maxTypes: groupTypes, relationCriteria });
    }, [avgLevel, partySize, difficulty, ruleset, budget, groupTypes, relationCriteria]);

    const monsterRecommendations = useMemo(() => {
        return recommendMonstersForParty({
            level: avgLevel, size: partySize, difficulty, ruleset, budget,
            formation: mode,
            maxTypes: mode === "group" ? groupTypes : undefined,
            includeMinions: mode === "solo" ? includeMinions : undefined,
            relationCriteria,
        });
    }, [avgLevel, partySize, difficulty, ruleset, budget, mode, groupTypes, includeMinions, relationCriteria]);

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

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // ── Export helpers ──────────────────────────────────────────────────────

    const buildExportMeta = useCallback(() => ({
        generatedAt: new Date().toISOString(),
        party: { size: partySize, level: avgLevel },
        encounter: { difficulty, ruleset, budgetMode, mode, budget },
        filters: {
            includeMinions: mode === "solo" ? includeMinions : undefined,
            relationCriteria: mode === "solo" && includeMinions ? relationCriteria : mode === "group" ? relationCriteria : undefined,
            groupTypes: mode === "group" ? groupTypes : undefined,
        },
        monsterRecommendations: monsterRecommendations.map((r) => ({
            members: r.members.map((m: MonsterRecommendationMember) => ({ name: m.name, count: m.count, cr: m.cr })),
            adjustedXP: r.adjustedXP,
            fit: parseFloat((r.fit * 100).toFixed(1)),
            budgetStatus: budgetStatus(r.fit).label,
        })),
        crMixOptions: mode === "solo"
            ? soloSuggestions.map((s) => ({
                mix: formatBossMinions(s),
                adjustedXP: s.adjustedXP,
                fit: parseFloat((s.fit * 100).toFixed(1)),
            }))
            : groupSuggestions.map((g) => ({
                mix: formatGroupMembers(g.members),
                adjustedXP: g.adjustedXP,
                fit: parseFloat((g.fit * 100).toFixed(1)),
            })),
    }), [partySize, avgLevel, difficulty, ruleset, budgetMode, mode, budget, includeMinions, relationCriteria, groupTypes, monsterRecommendations, soloSuggestions, groupSuggestions]);

    const handleExportJSON = useCallback(() => {
        const data = buildExportMeta();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `encounter-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [buildExportMeta]);

    const handleExportPNG = useCallback(async () => {
        if (!resultsRef.current) return;
        setIsExporting(true);
        try {
            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(resultsRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false,
                removeContainer: true,
                onclone: (doc) => {
                    doc.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
                        el.style.color = "";
                        el.style.backgroundColor = "";
                    });
                },
            });
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `encounter-${Date.now()}.png`;
            a.click();
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleExportPDF = useCallback(async () => {
        if (!resultsRef.current) return;
        setIsExporting(true);
        try {
            const { default: html2canvas } = await import("html2canvas");
            const { default: jsPDF } = await import("jspdf");
            const canvas = await html2canvas(resultsRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false,
                removeContainer: true,
                onclone: (doc) => {
                    doc.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
                        el.style.color = "";
                        el.style.backgroundColor = "";
                    });
                },
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`encounter-${Date.now()}.pdf`);
        } finally {
            setIsExporting(false);
        }
    }, []);

    // ── Shared card renderer ────────────────────────────────────────────────

    const BudgetBar = ({ fit, accent = "gold" }: { fit: number; accent?: "gold" | "silver" }) => (
        <>
            <div className={`mt-4 h-px w-full ${accent === "silver" ? "bg-silver/10" : "bg-gold/10"} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${accent === "silver" ? "bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" : "bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]"}`}
                    style={{ width: `${Math.min(fit * 100, 100)}%` }}
                />
            </div>
            <div className={`mt-2 text-right text-[10px] ${accent === "silver" ? "text-silver/60" : "text-gold/60"} uppercase tracking-widest font-bold`}>
                {t("budgetFit")} {(fit * 100).toFixed(0)}%
            </div>
        </>
    );

    return (
        <section className="grid gap-8 glass-panel p-5 lg:p-12 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">

            {/* ── Header ── */}
            <header className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                <div>
                    <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">{t("title")}</h1>
                    <p className="text-muted mt-2 font-light italic">{t("description")}</p>
                    <p className="text-xs text-muted mt-2">{t("rulesetNote")}</p>
                    <WhyDifferent className="mt-3" />
                </div>
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic hidden lg:inline-flex">
                    {t("viewDocs")}
                </Link>
            </header>

            {/* ── Quick presets ── */}
            <Card className="p-5 border-gold/10">
                <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_auto] items-center">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-3">{t("quickPresets")}</div>
                        <div className="flex flex-wrap gap-2">
                            {partyPresets.map((preset) => (
                                <Button key={preset.label} onClick={() => setPartySize(preset.size)} className="px-3 py-1.5 text-xs uppercase tracking-widest">
                                    {preset.label}
                                </Button>
                            ))}
                            <span className="w-px self-stretch bg-gold/10 mx-1 hidden sm:block" />
                            {levelPresets.map((preset) => (
                                <Button key={preset.label} onClick={() => setAvgLevel(preset.level)} className="px-3 py-1.5 text-xs uppercase tracking-widest">
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted max-w-xs hidden lg:block">{t("budgetMath")}</p>
                </div>
            </Card>

            {/* ── Controls ── */}
            <div className="grid gap-8">
                {/* Party config */}
                <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gold/50 font-bold mb-4">Party</div>
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
                </div>

                {/* Encounter config */}
                <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gold/50 font-bold mb-4">Encounter</div>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <FormField label={t("budgetType")}>
                            <Select value={budgetMode} onChange={(e) => setBudgetMode(e.target.value as BudgetMode)} aria-label="XP budget type">
                                <option value="encounter">{t("encounterBudget")}</option>
                                <option value="daily">{t("dailyBudget")}</option>
                            </Select>
                        </FormField>
                        <FormField label={t("formation")}>
                            <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label="Encounter type mode">
                                <option value="solo">{t("soloBoss")}</option>
                                <option value="group">{t("hordeGroup")}</option>
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
                        {mode === "solo" && includeMinions && (
                            <FormField label={t("relationCriteria")}>
                                <Select value={relationCriteria} onChange={(e) => setRelationCriteria(e.target.value as RelationCriteria)} aria-label="Relation criteria for minions">
                                    <option value="any">{t("anySpecies")}</option>
                                    <option value="terrain">{t("sameTerrain")}</option>
                                    <option value="affiliation">{t("sameAffiliation")}</option>
                                    <option value="genus">{t("sameGenus")}</option>
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
                        {mode === "group" && (
                            <FormField label={t("relationCriteria")}>
                                <Select value={relationCriteria} onChange={(e) => setRelationCriteria(e.target.value as RelationCriteria)} aria-label="Relation criteria for horde">
                                    <option value="any">{t("anySpecies")}</option>
                                    <option value="terrain">{t("sameTerrain")}</option>
                                    <option value="affiliation">{t("sameAffiliation")}</option>
                                    <option value="genus">{t("sameGenus")}</option>
                                </Select>
                            </FormField>
                        )}
                    </div>
                </div>
            </div>

            <Button
                variant="primary"
                onClick={scrollToResults}
                className="w-full lg:w-auto lg:self-start px-10 py-3 uppercase tracking-widest font-serif"
            >
                {t("showSuggestions")}
            </Button>

            {/* ── Results ── */}
            <Card className="p-6" ref={resultsRef}>

                {/* Results header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gold/10 pb-5 mb-6">
                    <div>
                        <h2 className="font-serif text-2xl accent-gold uppercase tracking-wide">{t("suggestedEncounters")}</h2>
                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gold/60">
                            <span className="border border-gold/20 px-2 py-0.5">Party {partySize}</span>
                            <span className="border border-gold/20 px-2 py-0.5">Lv {avgLevel}</span>
                            <span className="border border-gold/20 px-2 py-0.5">{difficulty}</span>
                            <span className="border border-gold/20 px-2 py-0.5">{ruleset}</span>
                            <span className="border border-gold/20 px-2 py-0.5">{budgetMode}</span>
                            {mode === "solo" && includeMinions && <span className="border border-gold/20 px-2 py-0.5">+minions</span>}
                            {(mode === "group" || (mode === "solo" && includeMinions)) && relationCriteria !== "any" && (
                                <span className="border border-gold/20 px-2 py-0.5">{relationCriteria}</span>
                            )}
                            {mode === "group" && <span className="border border-gold/20 px-2 py-0.5">≤{groupTypes} types</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        <span className="text-sm font-medium uppercase tracking-widest">
                            {t("totalXPBudget")}: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span>
                        </span>
                        {primaryStatus && (
                            <span className={`text-[10px] px-3 py-1 rounded-sm uppercase font-bold tracking-widest border border-gold/20 ${primaryStatus.color}`}>
                                {t("budgetStatus")}: {primaryStatus.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Export toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-gold/10">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold/50 font-bold">Export</span>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleExportJSON}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold border border-gold/20 text-gold/70 hover:border-gold/50 hover:text-gold transition-colors rounded-sm"
                            title="Download encounter as JSON metadata"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 2h6l3 3v9H4V2z" /><path d="M10 2v3h3" /><path d="M6 9l2 2 2-2" /><path d="M8 7v4" />
                            </svg>
                            JSON
                        </button>
                        <button
                            onClick={handleExportPNG}
                            disabled={isExporting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold border border-gold/20 text-gold/70 hover:border-gold/50 hover:text-gold transition-colors rounded-sm disabled:opacity-40"
                            title="Save results as PNG image"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="1" y="3" width="14" height="10" rx="1" /><circle cx="5.5" cy="7" r="1.5" /><path d="M1 11l4-3 3 3 3-4 4 4" />
                            </svg>
                            {isExporting ? "…" : "PNG"}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest font-bold border border-gold/20 text-gold/70 hover:border-gold/50 hover:text-gold transition-colors rounded-sm disabled:opacity-40"
                            title="Save results as PDF"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 2h6l3 3v9H4V2z" /><path d="M10 2v3h3" /><path d="M5 9h2c.6 0 1-.4 1-1s-.4-1-1-1H5v4" /><path d="M10 7h1c.6 0 1 .4 1 1v1c0 .6-.4 1-1 1h-1V7z" /><path d="M13.5 9h-1" />
                            </svg>
                            {isExporting ? "…" : "PDF"}
                        </button>
                    </div>
                </div>

                {/* Recommended mix highlight */}
                {mode === "solo" && primarySolo && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("recommendedMix")}</div>
                        <div className="mt-2 font-serif text-lg accent-gold">{formatBossMinions(primarySolo)}</div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primarySolo.fit * 100).toFixed(0)}% · {budgetStatus(primarySolo.fit).label}
                        </div>
                    </div>
                )}
                {mode === "group" && primaryGroup && (
                    <div className="mb-6 rounded-sm border-2 border-gold/30 bg-gold/5 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("recommendedMix")}</div>
                        <div className="mt-2 font-serif text-lg accent-gold">{formatGroupMembers(primaryGroup.members)}</div>
                        <div className="text-xs text-muted mt-1">
                            {t("budgetFit")} {(primaryGroup.fit * 100).toFixed(0)}% · {budgetStatus(primaryGroup.fit).label}
                        </div>
                    </div>
                )}

                {/* Monster recommendations */}
                {monsterRecommendations.length > 0 && (
                    <section className="mb-10">
                        <div className="mb-4">
                            <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">{t("monsterRecommendations")}</h3>
                            <p className="text-xs text-muted mt-1">{t("monsterRecommendationsNote")}</p>
                        </div>
                        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                            {monsterRecommendations.map((recommendation, i) => (
                                <li key={i}>
                                    <Card className="p-5 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-glow bg-bg/50">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                {recommendation.members.map((m: MonsterRecommendationMember, idx: number) => (
                                                    <span key={idx}>
                                                        <span className="font-bold text-xl accent-gold">{m.count}</span>
                                                        <span className="text-muted mx-1 font-sans italic">&times;</span>
                                                        <span className="text-foreground text-lg">{m.name}</span>
                                                        {idx < recommendation.members.length - 1 && <span className="text-gold/30 mx-2">|</span>}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-muted text-xs font-bold uppercase shrink-0">{recommendation.adjustedXP.toLocaleString()} XP</div>
                                        </div>
                                        <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(recommendation.fit).color}`}>
                                            {budgetStatus(recommendation.fit).label}
                                        </div>
                                        <BudgetBar fit={recommendation.fit} />
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* CR mix options */}
                <section>
                    <div className="mb-4">
                        <h3 className="font-serif text-xl accent-gold uppercase tracking-wide">{t("crMixOptions")}</h3>
                        <p className="text-xs text-muted mt-1">{t("crMixOptionsNote")}</p>
                    </div>

                    {mode === "solo" ? (
                        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                            {soloSuggestions.map((s, i) => (
                                <li key={i}>
                                    <Card className="p-5 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-glow bg-bg/50">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="font-serif text-xl accent-gold">{formatBossMinions(s)}</div>
                                            <div className="text-muted text-xs font-bold uppercase shrink-0">{s.adjustedXP.toLocaleString()} XP</div>
                                        </div>
                                        <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(s.fit).color}`}>
                                            {budgetStatus(s.fit).label}
                                        </div>
                                        <BudgetBar fit={s.fit} />
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {groupSuggestions.map((g, i) => (
                                <li key={i}>
                                    <Card className="p-5 border border-silver/10 hover:border-silver/30 transition-all hover:shadow-glow bg-bg/50">
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                {g.members.map((m, idx) => (
                                                    <span key={idx}>
                                                        <span className="font-bold text-xl accent-gold">{m.count}</span>
                                                        <span className="text-muted mx-1 font-sans italic">&times;</span>
                                                        <span className="text-foreground text-lg">CR {formatCR(m.cr)}</span>
                                                        {idx < g.members.length - 1 && <span className="text-gold/30 mx-2">|</span>}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-muted text-xs font-bold uppercase shrink-0">{g.adjustedXP.toLocaleString()} XP</div>
                                        </div>
                                        <div className={`mt-2 text-[10px] uppercase tracking-widest font-bold ${budgetStatus(g.fit).color}`}>
                                            {budgetStatus(g.fit).label}
                                        </div>
                                        <BudgetBar fit={g.fit} accent="silver" />
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </Card>

            <p className="text-xs text-muted italic text-center">{t("calculationsNote")}</p>

            <div className="hidden lg:block pt-4">
                <Link href={`/${locale}/encounter-builder/docs`} className="ui-link text-sm italic inline-flex justify-center w-full">
                    {t("viewDocs")}
                </Link>
            </div>
        </section>
    );
}