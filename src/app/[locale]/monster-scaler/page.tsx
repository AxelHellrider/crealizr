"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { CR_VALUES } from "@/app/data/constants";
import { formatCR } from "@/app/lib/format";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { InfoGrid } from "@/app/components/molecules/InfoGrid";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { StatRow } from "@/app/components/molecules/StatRow";
import { AbilityScoreGrid, type AbilityKey, type AbilityScores } from "@/app/components/molecules/AbilityScoreGrid";
import { Autocomplete } from "@/app/components/atoms/Autocomplete";
import { StatBlockDisplay } from "./_components/StatBlockDisplay";
import { useMonsterScaler } from "@/app/hooks/useMonsterScaler";
import { useMonsterExport } from "@/app/hooks/useExport";
import type { MonsterBase } from "@/app/types/monster";

export default function ScalePage() {
    const t = useTranslations("monsterScaler");
    const locale = useLocale();
    const { addMonster: saveToLibrary } = useCustomMonsters();

    const {
        monster, setMonster,
        targetCR, setTargetCR,
        scaledMonster,
        acSource, setAcSource,
        armorBonus, setArmorBonus,
        naturalArmor, setNaturalArmor,
        hasShield, setHasShield,
        abilityBonus,
        catalogSearch, setCatalogSearch,
        saved, setSaved,
        allMonsters,
        isScaling,
        handleLoadFromCatalog,
        handleStatChange,
        handleAbilityBonusChange,
        handleScale,
        resetToForm,
    } = useMonsterScaler();

    const { exportAs, isExporting } = useMonsterExport();

    const exportLabels = () => ({
        fallbackName: t("scaledMonster"),
        armorClass: t("armorClass"),
        hitPoints: t("hitPoints"),
        speed: t("speed"),
        challengeRating: t("challengeRating"),
        suggestedDamagePerRound: t("suggestedDamagePerRound"),
    });

    return (
        <PageSection>
            {!scaledMonster && (
                <div className="grid gap-8">
                    <PageHeader title={t("title")} description={t("description")}>
                        <Link href={'/monster-scaler/docs'} scroll={false} className="ui-link text-sm italic">
                            {t("viewDocs")}
                        </Link>
                    </PageHeader>

                    <Card className="p-6 border-gold/10">
                        <SectionHeader>Load from Bestiary</SectionHeader>
                        <SubLabel className="mb-3">Search the SRD or your homebrew monsters to pre-fill the form</SubLabel>
                        <Autocomplete
                            options={allMonsters.map((m) => m.name)}
                            value={catalogSearch}
                            onChange={(val) => { setCatalogSearch(val); handleLoadFromCatalog(val); }}
                            placeholder="Search monsters…"
                        />
                    </Card>

                    <InfoGrid items={[
                        { label: t("whatScales"), description: t("whatScalesDesc") },
                        { label: t("acSourceNotes"), description: t("acSourceNotesDesc") },
                        { label: t("guardrails"), description: t("guardrailsDesc") },
                    ]} />

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
                        <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
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

                    <Card className="p-6">
                        <SectionHeader>{t("defenseAdjustments")}</SectionHeader>
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                            <FormField label={t("acSource")}>
                                <Select value={acSource} onChange={(e) => setAcSource(e.target.value as typeof acSource)}>
                                    <option value="dex">{t("acSourceDex")}</option>
                                    <option value="armor">{t("acSourceArmor")}</option>
                                    <option value="natural">{t("acSourceNatural")}</option>
                                </Select>
                            </FormField>
                            {acSource === "armor" && (
                                <FormField label={t("armorBonus")}>
                                    <Input type="number" value={armorBonus} onChange={(e) => setArmorBonus(Number(e.target.value))} />
                                </FormField>
                            )}
                            {acSource === "natural" && (
                                <FormField label={t("naturalArmorValue")}>
                                    <Input type="number" value={naturalArmor} onChange={(e) => setNaturalArmor(Number(e.target.value))} />
                                </FormField>
                            )}
                            <FormField label={t("shield")}>
                                <label className="flex items-center gap-3 cursor-pointer h-full">
                                    <input type="checkbox" className="ui-checkbox" checked={hasShield} onChange={(e) => setHasShield(e.target.checked)} />
                                    <span className="text-sm text-muted">{t("shieldHint")}</span>
                                </label>
                            </FormField>
                        </div>
                        <SubLabel className="mt-8 mb-4">{t("abilityScoreBonuses")}</SubLabel>
                        <AbilityScoreGrid
                            values={{
                                str: abilityBonus?.str ?? 0,
                                dex: abilityBonus?.dex ?? 0,
                                con: abilityBonus?.con ?? 0,
                                int: abilityBonus?.int ?? 0,
                                wis: abilityBonus?.wis ?? 0,
                                cha: abilityBonus?.cha ?? 0,
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
                        return (
                            <Card className="p-6 border-gold/10">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 border-b border-gold/10 pb-3 mb-4">
                                    <h2 className="font-serif text-xl uppercase tracking-wide">{t("tuningNotes")}</h2>
                                    <span className="text-xs text-muted italic">{t("derivedFromMatrix")}</span>
                                </div>
                                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                                    <StatRow label={t("suggestedAttackBonus")}>{advice?.suggestedAttackBonus ?? "—"}</StatRow>
                                    <StatRow label={t("suggestedSaveDC")}>{advice?.suggestedSaveDC ?? "—"}</StatRow>
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
                        <Button data-testid="adjust-stats-btn" onClick={resetToForm} className="flex-1 font-serif tracking-widest uppercase text-xs">
                            {t("adjustStats")}
                        </Button>
                        <Button variant="primary" disabled={isExporting} onClick={() => exportAs(scaledMonster, scaledMonster.name || "monster", "png", exportLabels())} className="flex-1">
                            {t("downloadPng")}
                        </Button>
                        <Button variant="primary" disabled={isExporting} onClick={() => exportAs(scaledMonster, scaledMonster.name || "monster", "pdf", exportLabels())} className="flex-1">
                            {t("downloadPdf")}
                        </Button>
                        <Button
                            data-testid="save-to-bestiary-btn"
                            onClick={async () => {
                                await saveToLibrary({ ...scaledMonster, terrain: ["any"], affiliation: "any" });
                                setSaved(true);
                            }}
                            disabled={saved}
                            className="flex-1 font-serif tracking-widest uppercase text-xs disabled:opacity-40"
                        >
                            {saved ? "✓ Saved to Bestiary" : "Save to My Bestiary"}
                        </Button>
                    </div>
                    {saved && (
                        <p className="text-xs text-center text-gold/60">
                            Saved to{" "}
                            <Link href={`/${locale}/my-monsters`} scroll={false} className="ui-link">My Bestiary</Link>
                            {" "}— stored in your browser locally.
                        </p>
                    )}
                    <div className="text-xs text-muted italic text-center">{t("exportNote")}</div>
                </div>
            )}

            <div className="hidden lg:block pt-4">
                <Link href={'/monster-scaler/docs'} scroll={false} className={"ui-link text-sm italic inline-flex justify-center w-full"}>{t("viewDocs")}</Link>
            </div>
        </PageSection>
    );
}
