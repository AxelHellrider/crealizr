"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { scaleMonster2014, scaleMonster2024 } from "@/app/utils/scaler";
import { MonsterBase } from "@/app/types/monster";
import { CR_VALUES } from "@/app/data/constants";
import { formatCR } from "@/app/lib/format";
import { exportMonster } from "@/app/lib/exportCard";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { InfoGrid } from "@/app/components/molecules/InfoGrid";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { StatRow } from "@/app/components/molecules/StatRow";
import { StatBlockDisplay } from "@/app/components/organisms/StatBlockDisplay";
import { AbilityScoreGrid, type AbilityKey, type AbilityScores } from "@/app/components/molecules/AbilityScoreGrid";
import { Autocomplete } from "@/app/components/atoms/Autocomplete";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";

export default function ScalePage() {
    const t = useTranslations("monsterScaler");
    const locale = useLocale();
    const { addMonster: saveToLibrary } = useCustomMonsters();
    const { catalog2014, catalog2024 } = useMergedCatalog();
    const [saved, setSaved] = useState(false);
    const [isScaling, startScaling] = useTransition();
    const [monster, setMonster] = useState<MonsterBase>({
        name: "",
        edition: "2014",
        size: "Medium",
        type: "",
        dpr: {
            min: 1,
            max: 1,
            range: ""
        },
        alignment: "Unaligned",
        cr: 0.125,
        terrain: ["any"],
        affiliation: "any",
        xp: 0,
        stats: { ac: 10, hp: 1, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, speed: "30 ft" },
        raw_source_ref: "",
    });
    const [edition, setEdition] = useState<"2014" | "2024">("2014");
    const [targetCR, setTargetCR] = useState<number | null>(null);
    const [scaledMonster, setScaledMonster] = useState<MonsterBase | null>(null);
    const [acEquipment, setAcEquipment] = useState<number>(0);
    const [acRace, setAcRace] = useState<number>(0);
    const [abilityBonus, setAbilityBonus] = useState<Partial<Record<keyof MonsterBase["stats"], number>>>({});
    const [catalogSearch, setCatalogSearch] = useState("");
    const allMonsters = useMemo(() => {
        const combined = [...catalog2014, ...catalog2024];
        const seen = new Set<string>();
        return combined.filter((m) => {
            const key = `${m.name}|${m.edition}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [catalog2014, catalog2024]);

    const handleLoadFromCatalog = (name: string) => {
        const match = allMonsters.find((m) => m.name === name);
        if (!match) return;
        const ed = match.edition ?? "2014";
        setEdition(ed as "2014" | "2024");
        setMonster((prev) => ({
            ...prev,
            name: match.name,
            type: match.type ?? match.affiliation ?? prev.type,
            cr: match.cr,
            edition: ed as "2014" | "2024",
            terrain: match.terrain,
            affiliation: match.affiliation,
            genus: match.genus,
            size: match.size ?? prev.size,
            stats: match.stats ?? prev.stats,
            actions: match.actions ?? prev.actions,
        }));
        setTargetCR(null);
        setScaledMonster(null);
        setCatalogSearch("");
    };

    const handleStatChange = (stat: keyof MonsterBase["stats"], value: number | string) => {
        setMonster((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: value } }));
    };

    const handleAbilityBonusChange = (stat: keyof MonsterBase["stats"], value: number) => {
        setAbilityBonus((prev) => ({ ...prev, [stat]: value }));
    };

    /**
     * Handle scaling with a small timeout to prevent UI lag on rapid input.
     * Effectively a simple debounce for UX performance.
     */
    const handleScale = () => {
        if (targetCR === null) return;
        startScaling(() => {
            const base = { ...monster, edition };
            const fn = edition === "2024" ? scaleMonster2024 : scaleMonster2014;
            setScaledMonster(fn(base, targetCR, { acEquipment, acRace, abilityScoreBonus: abilityBonus }));
        });
    };

    const exportLabels = () => ({
        fallbackName: t("scaledMonster"),
        armorClass: t("armorClass"),
        hitPoints: t("hitPoints"),
        speed: t("speed"),
        challengeRating: t("challengeRating"),
        suggestedDamagePerRound: t("suggestedDamagePerRound"),
    });

    const downloadImage = () =>
        scaledMonster && exportMonster(scaledMonster, scaledMonster.name || "monster", "png", exportLabels());

    const downloadPDF = () =>
        scaledMonster && exportMonster(scaledMonster, scaledMonster.name || "monster", "pdf", exportLabels());

    return (
        <PageSection>
            {!scaledMonster && (
                <div className="grid gap-8">
                    <PageHeader title={t("title")} description={t("description")}>
                        <WhyDifferent className="mt-3 lg:mt-0" />
                        <a href="/monster-scaler/docs" className="ui-link text-sm italic">{t("viewDocs")}</a>
                    </PageHeader>

                    <Card className="p-6 border-gold/10">
                        <SectionHeader>Load from Bestiary</SectionHeader>
                        <SubLabel className="mb-3">Search the SRD or your homebrew monsters to pre-fill the form</SubLabel>
                        <Autocomplete
                            options={allMonsters.map((m) => m.name)}
                            value={catalogSearch}
                            onChange={(val) => {
                                setCatalogSearch(val);
                                handleLoadFromCatalog(val);
                            }}
                            placeholder="Search monsters…"
                        />
                    </Card>

                    <InfoGrid items={[
                        { label: t("whatScales"), description: t("whatScalesDesc") },
                        { label: t("rulesetNotes"), description: t("rulesetNotesDesc") },
                        { label: t("guardrails"), description: t("guardrailsDesc") },
                    ]} />

                    {/* --- Basic Info --- */}
                    <Card className="p-6">
                        <SectionHeader>{t("generalInfo")}</SectionHeader>
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            <FormField label={t("name")}>
                                <Input data-testid="monster-name" value={monster.name} onChange={(e) => setMonster({ ...monster, name: e.target.value })} placeholder={t("namePlaceholder")} />
                            </FormField>
                            <FormField label={t("creatureType")}>
                                <Input value={monster.type} onChange={(e) => setMonster({ ...monster, type: e.target.value })} placeholder={t("typePlaceholder")} />
                            </FormField>
                        </div>
                        <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-3">
                            <FormField label={t("ruleset")}>
                                <Select value={edition} onChange={(e) => setEdition(e.target.value as "2014" | "2024")}>
                                    <option value="2014">2014 Ruleset</option>
                                    <option value="2024">2024 Ruleset</option>
                                </Select>
                            </FormField>
                            <FormField label={t("currentCR")}>
                                <Select data-testid="current-cr" value={monster.cr} onChange={(e) => setMonster({ ...monster, cr: Number(e.target.value) })}>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </FormField>
                            <FormField label={t("targetCR")}>
                                <Select data-testid="target-cr" value={targetCR ?? ""} onChange={(e) => setTargetCR(Number(e.target.value))}>
                                    <option value="" disabled>{t("selectTargetCR")}</option>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </FormField>
                        </div>
                    </Card>

                    {/* --- Base Stats --- */}
                    <Card className="p-6">
                        <SectionHeader>{t("baseAttributes")}</SectionHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <FormField label={t("ac")}>
                                <Input type="number" value={monster.stats.ac} onChange={(e) => handleStatChange("ac", Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("hp")}>
                                <Input type="number" value={monster.stats.hp} onChange={(e) => handleStatChange("hp", Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("speed")}>
                                <Input value={monster.stats.speed} onChange={(e) => handleStatChange("speed", e.target.value)} />
                            </FormField>
                        </div>
                        <AbilityScoreGrid
                            values={{ str: monster.stats.str, dex: monster.stats.dex, con: monster.stats.con, int: monster.stats.int, wis: monster.stats.wis, cha: monster.stats.cha } as AbilityScores}
                            onChange={(key, value) => handleStatChange(key as keyof MonsterBase["stats"], value)}
                        />
                    </Card>

                    {/* --- Additional Bonuses --- */}
                    <Card className="p-6">
                        <SectionHeader>{t("defenseAdjustments")}</SectionHeader>

                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                            <FormField label={t("equipmentACBonus")}>
                                <Input type="number" value={acEquipment} onChange={(e) => setAcEquipment(Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("naturalArmorBonus")}>
                                <Input type="number" value={acRace} onChange={(e) => setAcRace(Number(e.target.value))} />
                            </FormField>
                        </div>

                        <SubLabel className="mt-8 mb-4">{t("abilityScoreBonuses")}</SubLabel>
                        <AbilityScoreGrid
                            values={{
                                str: abilityBonus.str ?? 0,
                                dex: abilityBonus.dex ?? 0,
                                con: abilityBonus.con ?? 0,
                                int: abilityBonus.int ?? 0,
                                wis: abilityBonus.wis ?? 0,
                                cha: abilityBonus.cha ?? 0,
                            }}
                            onChange={(key: AbilityKey, value: number) => handleAbilityBonusChange(key as keyof MonsterBase["stats"], value)}
                        />
                    </Card>

                    <Button data-testid="scale-btn" onClick={handleScale} variant="primary" disabled={isScaling} className="px-12 py-4 text-lg w-full lg:w-auto self-start">
                        {isScaling ? t("scaling") : t("scaleMonster")}
                    </Button>
                </div>
            )}

            {scaledMonster && (
                <div className="grid gap-6">
                    {(() => {
                        const advice = (scaledMonster as MonsterBase & { _advice?: { suggestedAttackBonus?: number; suggestedSaveDC?: number } })._advice;
                        const suggestedAttackBonus = advice?.suggestedAttackBonus;
                        const suggestedSaveDC = advice?.suggestedSaveDC;

                        return (
                            <Card className="p-6 border-gold/10">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 border-b border-gold/10 pb-3 mb-4">
                                    <h2 className="font-serif text-xl uppercase tracking-wide">{t("tuningNotes")}</h2>
                                    <span className="text-xs text-muted italic">{t("derivedFromMatrix")}</span>
                                </div>
                                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                                    <StatRow label={t("suggestedAttackBonus")}>{suggestedAttackBonus ?? "—"}</StatRow>
                                    <StatRow label={t("suggestedSaveDC")}>{suggestedSaveDC ?? "—"}</StatRow>
                                </div>
                            </Card>
                        );
                    })()}
                    <Card className="p-6 border-gold/10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gold/10 pb-3 mb-4">
                            <h2 className="font-serif text-xl uppercase tracking-wide">{t("beforeAfter")}</h2>
                            <span className="text-xs text-muted italic">{t("snapshotOutput")}</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 text-sm">
                            <div className="space-y-2">
                                <SubLabel className="mb-2">{t("original")}</SubLabel>
                                <StatRow label={t("ac")}>{monster.stats.ac}</StatRow>
                                <StatRow label={t("hp")}>{monster.stats.hp}</StatRow>
                                <StatRow label={t("dpr")}>{monster.dpr.range}</StatRow>
                                <StatRow label={t("cr")}>{formatCR(monster.cr)}</StatRow>
                            </div>
                            <div className="space-y-2">
                                <SubLabel className="mb-2">{t("scaled")}</SubLabel>
                                <StatRow label={t("ac")}>{scaledMonster.stats.ac}</StatRow>
                                <StatRow label={t("hp")}>{scaledMonster.stats.hp}</StatRow>
                                <StatRow label={t("dpr")}>{scaledMonster.dpr?.range ?? "—"}</StatRow>
                                <StatRow label={t("cr")}>{formatCR(scaledMonster.cr)}</StatRow>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 grid-cols-1 lg:grid-cols-3">
                            <StatRow label={t("acChange")}>{scaledMonster.stats.ac - monster.stats.ac >= 0 ? "+" : ""}{scaledMonster.stats.ac - monster.stats.ac}</StatRow>
                            <StatRow label={t("hpChange")}>{scaledMonster.stats.hp - monster.stats.hp >= 0 ? "+" : ""}{scaledMonster.stats.hp - monster.stats.hp}</StatRow>
                            <StatRow label={t("crShift")}><span data-testid="cr-shift">{formatCR(monster.cr)} → {formatCR(scaledMonster.cr)}</span></StatRow>
                        </div>
                    </Card>

                    <div className="flex items-center justify-between">
                        <SubLabel>{t("exportPreview")}</SubLabel>
                        <span className="text-xs text-muted">{t("pngPdfLayout")}</span>
                    </div>
                    <StatBlockDisplay
                        monster={scaledMonster}
                        labels={{
                            fallbackName: t("scaledMonster"),
                            armorClass: t("armorClass"),
                            hitPoints: t("hitPoints"),
                            speed: t("speed"),
                            challengeRating: t("challengeRating"),
                            suggestedDamagePerRound: t("suggestedDamagePerRound"),
                        }}
                    />

                    <SubLabel className="mb-2">{t("exportOptions")}</SubLabel>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <Button data-testid="adjust-stats-btn" onClick={() => setScaledMonster(null)} className="flex-1 font-serif tracking-widest uppercase text-xs">
                            {t("adjustStats")}
                        </Button>
                        <Button variant="primary" onClick={downloadImage} className="flex-1">
                            {t("downloadPng")}
                        </Button>
                        <Button variant="primary" onClick={downloadPDF} className="flex-1">
                            {t("downloadPdf")}
                        </Button>
                        <Button
                            data-testid="save-to-bestiary-btn"
                            onClick={async () => {
                                if (scaledMonster) {
                                    await saveToLibrary({ ...scaledMonster, terrain: ["any"], affiliation: "any" });
                                    setSaved(true);
                                }
                            }}
                            disabled={!scaledMonster || saved}
                            className="flex-1 font-serif tracking-widest uppercase text-xs disabled:opacity-40"
                        >
                            {saved ? "✓ Saved to Bestiary" : "Save to My Bestiary"}
                        </Button>
                    </div>
                    {saved && (
                        <p className="text-xs text-center text-gold/60">
                            Saved to{" "}
                            <Link href={`/${locale}/my-monsters`} className="ui-link">
                                My Bestiary
                            </Link>
                            {" "}— stored in your browser locally.
                        </p>
                    )}
                    <div className="text-xs text-muted italic text-center">
                        {t("exportNote")}
                    </div>
                </div>
            )}

            <div className="hidden lg:block pt-4">
                <a href="/monster-scaler/docs" className="ui-link text-sm italic inline-flex justify-center w-full">{t("viewDocs")}</a>
            </div>
        </PageSection>
    );
}