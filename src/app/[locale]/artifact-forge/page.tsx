"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { Textarea } from "@/app/components/atoms/Textarea";
import { FormField } from "@/app/components/molecules/FormField";
import { Tag } from "@/app/components/molecules/Tag";
import { ToggleChip } from "@/app/components/molecules/ToggleChip";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { ItemPreviewCard } from "./_components/ItemPreviewCard";
import { useArtifactForge } from "@/app/hooks/useArtifactForge";
import { useItemExport } from "@/app/hooks/useExport";
import type { ItemType } from "@/app/services/itemService";

const TYPES: ItemType[] = ["Weapon", "Armor", "Wand", "Wondrous"];
const COMMON_TARGETS = ["undead", "fiend", "dragon", "construct"];
const QUICK_INGREDIENTS = [
    { name: "Silver dust", quantity: 1, unit: "pouch" },
    { name: "Dragon scale", quantity: 1, unit: "scale" },
    { name: "Runic ink", quantity: 1, unit: "vial" },
    { name: "Blessed water", quantity: 1, unit: "flask" },
];

const EXAMPLE_ITEMS = [
    {
        name: "Stormglass Pike", type: "Weapon" as ItemType, level: 8, attunement: true,
        targets: ["elemental", "dragon"], ingredients: [{ name: "Stormglass shard", quantity: 1 }],
        craftingCost: 750, craftingTime: 7, craftingTimeUnit: "days" as const,
        craftingRequirement: "Forged at a coastal storm-forge by an artificer.",
        lore: "Tempered in lightning winds, the pike hums when storms gather and sings against winged foes.",
    },
    {
        name: "Aegis of the Dawn", type: "Armor" as ItemType, level: 12, attunement: true,
        targets: ["undead"], ingredients: [{ name: "Dawnsteel ingot", quantity: 2 }],
        craftingCost: 2400, craftingTime: 14, craftingTimeUnit: "days" as const,
        craftingRequirement: "Blessed in a consecrated temple at sunrise.",
        lore: "A shield-ward that gleams with first light, sworn to turn the tide against the restless dead.",
    },
    {
        name: "Cinderleaf Wand", type: "Wand" as ItemType, level: 5, attunement: false,
        targets: ["plant", "beast"], ingredients: [{ name: "Cinderleaf sprig", quantity: 3 }],
        craftingCost: 180, craftingTime: 2, craftingTimeUnit: "days" as const,
        craftingRequirement: "Woven in a druidic grove during a new moon.",
        lore: "Warm to the touch, it encourages wild growth and smolders faintly in moonlight.",
    },
];

export default function ItemCreatorPage() {
    const t = useTranslations("artifactForge");
    const outputRef = useRef<HTMLDivElement>(null);

    const {
        fields, setField,
        item,
        loreWordCount,
        handleLoreChange,
        addTag, addTarget, removeTag,
        addIngredient, removeIngredient, addQuickIngredient,
        applyExample, clearFlavor, clearCrafting,
    } = useArtifactForge();

    const { exportAs, isExporting } = useItemExport();

    const scrollToOutput = () => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    return (
        <PageSection>
            <PageHeader title={t("title")} description={t("description")}>
                <a href="/artifact-forge/docs" className="ui-link text-sm italic">{t("viewDocs")}</a>
            </PageHeader>

            <Card className="p-6 border-gold/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <SubLabel className="mb-3">{t("quickActions")}</SubLabel>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => applyExample(EXAMPLE_ITEMS[Math.floor(Math.random() * EXAMPLE_ITEMS.length)])} className="px-4 text-xs font-bold uppercase tracking-widest">{t("useExample")}</Button>
                            <Button onClick={clearFlavor} className="px-4 text-xs font-bold uppercase tracking-widest">{t("clearFlavor")}</Button>
                            <Button onClick={clearCrafting} className="px-4 text-xs font-bold uppercase tracking-widest">{t("clearCrafting")}</Button>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group" title="Prevent item type changes from overwriting the bonuses you've already set">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
                            checked={fields.lockMechanics}
                            onChange={(e) => setField("lockMechanics", e.target.checked)}
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium uppercase tracking-widest text-muted group-hover:text-gold transition-colors">{t("lockMechanics")}</span>
                            <span className="text-[10px] text-muted/50">Keep my bonuses when changing item type</span>
                        </div>
                    </label>
                </div>
                <p className="mt-4 text-sm text-muted">{t("mechanicsNote")}</p>
            </Card>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {EXAMPLE_ITEMS.slice(0, 3).map((example) => (
                    <Card key={example.name} className="p-5 border-gold/10 bg-card">
                        <SubLabel className="mb-2">{t("example")}</SubLabel>
                        <h3 className="mt-2 font-serif text-lg accent-gold">{example.name}</h3>
                        <p className="text-xs text-muted mt-1">{example.type} · Level {example.level}</p>
                        <p className="text-sm text-muted mt-3 italic">&quot;{example.lore}&quot;</p>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <SubLabel>{t("mechanics")}</SubLabel>
                </div>

                <FormField label={t("itemName")}>
                    <Input value={fields.name} onChange={(e) => setField("name", e.target.value)} placeholder={t("itemNamePlaceholder")} />
                </FormField>

                <FormField label={t("itemType")}>
                    <Select value={fields.type} onChange={(e) => setField("type", e.target.value as ItemType)}>
                        {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </Select>
                </FormField>

                <FormField label={t("recommendedLevel")}>
                    <Input type="number" value={fields.level} onChange={(e) => setField("level", Number(e.target.value))} />
                </FormField>

                <FormField label={t("effectiveAgainst")} sublabel={t("optional")}>
                    <div className="flex gap-2">
                        <Input value={fields.tagInput} onChange={(e) => setField("tagInput", e.target.value)} placeholder={t("effectiveAgainstPlaceholder")} />
                        <Button onClick={addTag} className="px-4 text-xs font-bold">{t("add")}</Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {COMMON_TARGETS.map((target) => (
                            <ToggleChip key={target} isActive={fields.targets.includes(target)} onClick={() => addTarget(target)} size="xs">
                                {target}
                            </ToggleChip>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 min-h-6">
                        {fields.targets.map((target) => (
                            <Tag key={target} onRemove={() => removeTag(target)}>{target}</Tag>
                        ))}
                    </div>
                </FormField>

                <div className="lg:col-span-2">
                    <SubLabel>{t("flavorCrafting")}</SubLabel>
                </div>

                <FormField label={t("craftingIngredients")} sublabel={t("optional")}>
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1.5fr_0.6fr_0.7fr_auto]">
                        <Input value={fields.ingredientName} onChange={(e) => setField("ingredientName", e.target.value)} placeholder={t("ingredientNamePlaceholder")} />
                        <Input type="number" value={fields.ingredientQty} onChange={(e) => setField("ingredientQty", e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("qtyPlaceholder")} />
                        <Input value={fields.ingredientUnit} onChange={(e) => setField("ingredientUnit", e.target.value)} placeholder={t("unitPlaceholder")} />
                        <Button onClick={addIngredient} className="px-4 text-xs font-bold">{t("add")}</Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {QUICK_INGREDIENTS.map((ingredient) => (
                            <ToggleChip key={ingredient.name} isActive={false} onClick={() => addQuickIngredient(ingredient)} size="xs">
                                {ingredient.name}
                            </ToggleChip>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 min-h-6">
                        {fields.ingredients.map((ingredient, index) => (
                            <Tag key={`${ingredient.name}-${index}`} onRemove={() => removeIngredient(index)}>
                                {ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} {ingredient.name}
                            </Tag>
                        ))}
                    </div>
                </FormField>

                <FormField label={t("craftingCost")} sublabel={t("optional")}>
                    <Input type="number" value={fields.craftingCost} onChange={(e) => setField("craftingCost", e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("craftingCostPlaceholder")} />
                </FormField>

                <FormField label={t("craftingTime")} sublabel={t("optional")}>
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1fr_1fr]">
                        <Input type="number" value={fields.craftingTime} onChange={(e) => setField("craftingTime", e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("craftingTimePlaceholder")} />
                        <Select value={fields.craftingTimeUnit} onChange={(e) => setField("craftingTimeUnit", e.target.value as "hours" | "days" | "weeks")}>
                            <option value="hours">{t("hours")}</option>
                            <option value="days">{t("days")}</option>
                            <option value="weeks">{t("weeks")}</option>
                        </Select>
                    </div>
                </FormField>

                <FormField label={t("craftingRequirement")} sublabel={t("optional")}>
                    <Input value={fields.craftingRequirement} onChange={(e) => setField("craftingRequirement", e.target.value)} placeholder={t("craftingRequirementPlaceholder")} />
                </FormField>

                <FormField label={t("itemLore")} sublabel={t("loreWordCount", { count: loreWordCount })}>
                    <Textarea
                        value={fields.lore}
                        onChange={(e) => handleLoreChange(e.target.value)}
                        placeholder={t("lorePlaceholder")}
                        rows={4}
                    />
                </FormField>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
                        checked={fields.attunement}
                        onChange={(e) => setField("attunement", e.target.checked)}
                    />
                    <span className="text-sm font-medium uppercase tracking-widest text-muted group-hover:text-gold transition-colors">{t("requiresAttunement")}</span>
                </label>
            </div>

            <Button variant="primary" onClick={scrollToOutput} className="w-full lg:w-auto px-10 py-3 uppercase tracking-widest font-serif">
                {t("viewItemBlueprint")}
            </Button>

            <ItemPreviewCard ref={outputRef} item={item} />

            <div className="flex flex-col lg:flex-row gap-4">
                <Button variant="primary" disabled={isExporting} onClick={() => exportAs(item, item.name || "artifact", "png")} className="flex-1">
                    {t("downloadPng")}
                </Button>
                <Button variant="primary" disabled={isExporting} onClick={() => exportAs(item, item.name || "artifact", "pdf")} className="flex-1">
                    {t("downloadPdf")}
                </Button>
            </div>

            <p className="text-xs text-muted italic text-center">{t("baselineNote")}</p>

            <div className="hidden lg:block pt-4">
                <a href="/artifact-forge/docs" className="ui-link text-sm italic inline-flex justify-center w-full">{t("viewDocs")}</a>
            </div>
        </PageSection>
    );
}
