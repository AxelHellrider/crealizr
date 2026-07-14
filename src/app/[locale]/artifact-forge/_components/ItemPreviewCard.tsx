"use client";

import React, { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/app/components/atoms/Card";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { StatRow } from "@/app/components/molecules/StatRow";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";
import type { ItemBlueprint } from "@/app/types/item";

interface ItemPreviewCardProps {
    item: ItemBlueprint;
}

export const ItemPreviewCard = forwardRef<HTMLDivElement, ItemPreviewCardProps>(
    ({ item }, ref) => {
        const t = useTranslations("artifactForge");

        return (
            <Card className="p-8 border-gold/10" ref={ref} data-export-card="true">
                <SectionHeader>{t("itemProperties")}</SectionHeader>
                <div className="flex items-center justify-between mb-4">
                    <SubLabel>{t("exportPreview")}</SubLabel>
                    <span className="text-xs text-muted">{t("matchesJsonOutput")}</span>
                </div>

                <div className="rounded-sm border border-gold/20 bg-gold/5 p-4 mb-6 text-sm">
                    <div className="font-serif text-lg accent-gold">{item.name || t("unnamedArtifact")}</div>
                    <div className="text-xs text-muted mt-1">
                        {item.rarity} · {item.type} · Level {item.levelTuned} · {item.attunement ? t("attunement") : t("noAttunement")}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                        {item.bonusToHit !== undefined && t("toHit", { value: item.bonusToHit })}
                        {item.bonusAC !== undefined && t("acBonus", { value: item.bonusAC })}
                        {item.bonusSaveDC !== undefined && t("saveDC", { value: item.bonusSaveDC })}
                        {item.avgDamageBonus !== undefined && t("avgDmg", { value: item.avgDamageBonus })}
                    </div>
                </div>

                <SubLabel className="mb-4">{t("mechanicalSummary")}</SubLabel>
                <CardContent className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <StatRow label={t("name")} valueClassName="font-serif accent-gold">{item.name || "—"}</StatRow>
                    <StatRow label={t("type")}>{item.type}</StatRow>
                    <StatRow label={t("rarity")} valueClassName="font-bold text-blue-400 uppercase tracking-widest">{item.rarity}</StatRow>
                    <StatRow label={t("attunement")}>{item.attunement ? t("required") : t("none")}</StatRow>
                    <StatRow label={t("powerBand")} valueClassName="font-medium italic">Level {item.levelTuned}</StatRow>
                    <StatRow label={t("special")} valueClassName="font-medium text-silver">{item.targetTags.join(", ") || t("none")}</StatRow>
                    <StatRow label={t("craftCost")}>{item.craftingCost !== undefined ? `${item.craftingCost} gp` : "—"}</StatRow>
                    <StatRow label={t("craftTime")}>{item.craftingTime !== undefined ? `${item.craftingTime} ${item.craftingTimeUnit ?? "days"}` : "—"}</StatRow>
                    {item.bonusToHit !== undefined && (
                        <StatRow label={t("toHitLabel")} valueClassName="font-bold text-gold">+{item.bonusToHit}</StatRow>
                    )}
                    {item.bonusAC !== undefined && (
                        <StatRow label={t("acBonusLabel")} valueClassName="font-bold text-blue-300">+{item.bonusAC}</StatRow>
                    )}
                    {item.bonusSaveDC !== undefined && (
                        <StatRow label={t("saveDCLabel")} valueClassName="font-bold text-purple-400">DC {item.bonusSaveDC}</StatRow>
                    )}
                    {item.avgDamageBonus !== undefined && (
                        <StatRow label={t("damageBonus")} valueClassName="font-bold text-red-400">+{item.avgDamageBonus} {t("avg")}</StatRow>
                    )}
                </CardContent>

                <SubLabel className="mt-8 mb-4">{t("loreCrafting")}</SubLabel>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <div className="flex flex-col gap-2 border-b border-gold/5 pb-2">
                        <span className="font-bold uppercase tracking-widest text-muted text-[10px]">{t("ingredients")}:</span>
                        <span className="font-medium text-silver break-words">
                            {item.ingredients.length
                                ? item.ingredients.map((i) => `${i.quantity}${i.unit ? ` ${i.unit}` : ""} ${i.name}`).join(", ")
                                : t("none")}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 border-b border-gold/5 pb-2">
                        <span className="font-bold uppercase tracking-widest text-muted text-[10px]">{t("craftingRequirementLabel")}:</span>
                        <span className="font-medium text-silver break-words">{item.craftingRequirement || t("none")}</span>
                    </div>
                    <div className="flex flex-col gap-2 border-b border-gold/5 pb-2 lg:col-span-2">
                        <span className="font-bold uppercase tracking-widest text-muted text-[10px]">{t("lore")}:</span>
                        <span className="font-medium text-silver break-words">{item.lore || t("none")}</span>
                    </div>
                </div>

                {item.notes && (
                    <div className="mt-8 p-6 bg-gold/5 rounded-sm border border-gold/20 text-base italic text-muted-foreground font-serif leading-relaxed">
                        &quot;{item.notes}&quot;
                    </div>
                )}

                <details className="mt-8 neo-card bg-background/40 border-gold/10 overflow-hidden">
                    <summary className="cursor-pointer p-4 text-[10px] text-muted hover:text-gold transition-colors uppercase tracking-[0.2em] font-bold">
                        {t("itemMetadata")}
                    </summary>
                    <pre className="p-6 overflow-x-auto text-[10px] text-blue-400/80 leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
                </details>
            </Card>
        );
    }
);
ItemPreviewCard.displayName = "ItemPreviewCard";
