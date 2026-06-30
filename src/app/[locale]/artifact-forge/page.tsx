"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { buildItem, ItemType } from "@/app/utils/items";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { Textarea } from "@/app/components/atoms/Textarea";
import { FormField } from "@/app/components/molecules/FormField";
import { Tag } from "@/app/components/molecules/Tag";
import { ToggleChip } from "@/app/components/molecules/ToggleChip";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { ItemPreviewCard } from "@/app/components/organisms/ItemPreviewCard";
import { exportItem } from "@/app/lib/exportCard";

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
    name: "Stormglass Pike",
    type: "Weapon" as ItemType,
    level: 8,
    attunement: true,
    targets: ["elemental", "dragon"],
    ingredients: [{ name: "Stormglass shard", quantity: 1 }],
    craftingCost: 750,
    craftingTime: 7,
    craftingTimeUnit: "days" as const,
    craftingRequirement: "Forged at a coastal storm-forge by an artificer.",
    lore: "Tempered in lightning winds, the pike hums when storms gather and sings against winged foes.",
  },
  {
    name: "Aegis of the Dawn",
    type: "Armor" as ItemType,
    level: 12,
    attunement: true,
    targets: ["undead"],
    ingredients: [{ name: "Dawnsteel ingot", quantity: 2 }],
    craftingCost: 2400,
    craftingTime: 14,
    craftingTimeUnit: "days" as const,
    craftingRequirement: "Blessed in a consecrated temple at sunrise.",
    lore: "A shield-ward that gleams with first light, sworn to turn the tide against the restless dead.",
  },
  {
    name: "Cinderleaf Wand",
    type: "Wand" as ItemType,
    level: 5,
    attunement: false,
    targets: ["plant", "beast"],
    ingredients: [{ name: "Cinderleaf sprig", quantity: 3 }],
    craftingCost: 180,
    craftingTime: 2,
    craftingTimeUnit: "days" as const,
    craftingRequirement: "Woven in a druidic grove during a new moon.",
    lore: "Warm to the touch, it encourages wild growth and smolders faintly in moonlight.",
  },
];

export default function ItemCreatorPage() {
  const t = useTranslations("artifactForge");
  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("Weapon");
  const [attunement, setAttunement] = useState(false);
  const [level, setLevel] = useState(5);
  const [targets, setTargets] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [ingredients, setIngredients] = useState<{ name: string; quantity: number; unit?: string }[]>([]);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQty, setIngredientQty] = useState<number | "">("");
  const [ingredientUnit, setIngredientUnit] = useState("");
  const [craftingCost, setCraftingCost] = useState<number | "">("");
  const [craftingTime, setCraftingTime] = useState<number | "">("");
  const [craftingTimeUnit, setCraftingTimeUnit] = useState<"hours" | "days" | "weeks">("days");
  const [craftingRequirement, setCraftingRequirement] = useState("");
  const [lore, setLore] = useState("");
  const [lockMechanics, setLockMechanics] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const item = useMemo(() => buildItem({
    name,
    type,
    attunement,
    level,
    targets,
    ingredients,
    craftingCost: craftingCost === "" ? undefined : craftingCost,
    craftingTime: craftingTime === "" ? undefined : craftingTime,
    craftingTimeUnit,
    craftingRequirement: craftingRequirement.trim() ? craftingRequirement.trim() : undefined,
    lore: lore.trim() ? lore.trim() : undefined,
  }), [name, type, attunement, level, targets, ingredients, craftingCost, craftingTime, craftingTimeUnit, craftingRequirement, lore]);

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (!targets.includes(v)) setTargets((arr) => [...arr, v]);
    setTagInput("");
  };

  const addTarget = (v: string) => {
    if (!targets.includes(v)) setTargets((arr) => [...arr, v]);
  };

  const removeTag = (v: string) => setTargets((arr) => arr.filter((x) => x !== v));

  const addIngredient = () => {
    const nameValue = ingredientName.trim();
    const quantityValue = typeof ingredientQty === "number" ? ingredientQty : Number(ingredientQty);
    if (!nameValue || !Number.isFinite(quantityValue) || quantityValue <= 0) return;
    setIngredients((arr) => [...arr, { name: nameValue, quantity: quantityValue, unit: ingredientUnit.trim() || undefined }]);
    setIngredientName("");
    setIngredientQty("");
    setIngredientUnit("");
  };

  const removeIngredient = (index: number) => setIngredients((arr) => arr.filter((_, i) => i !== index));

  const addQuickIngredient = (ingredient: { name: string; quantity: number; unit?: string }) => {
    setIngredients((arr) => [...arr, ingredient]);
  };

  const applyExample = () => {
    const example = EXAMPLE_ITEMS[Math.floor(Math.random() * EXAMPLE_ITEMS.length)];
    if (!lockMechanics) {
      setType(example.type);
      setLevel(example.level);
      setAttunement(example.attunement);
    }
    setName(example.name);
    setTargets(example.targets);
    setIngredients(example.ingredients);
    setCraftingCost(example.craftingCost);
    setCraftingTime(example.craftingTime);
    setCraftingTimeUnit(example.craftingTimeUnit);
    setCraftingRequirement(example.craftingRequirement);
    setLore(example.lore);
  };

  const clearFlavor = () => { setName(""); setTargets([]); setLore(""); };
  const clearCrafting = () => { setIngredients([]); setCraftingCost(""); setCraftingTime(""); setCraftingRequirement(""); };
  const scrollToOutput = () => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const loreWordCount = lore.trim() ? lore.trim().split(/\s+/).length : 0;
  const handleLoreChange = (value: string) => {
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    if (words.length <= 100) { setLore(value); return; }
    setLore(words.slice(0, 100).join(" "));
  };

  return (
    <PageSection>
      <PageHeader title={t("title")} description={t("description")}>
        <WhyDifferent className="mt-3 lg:mt-0" />
        <a href="/artifact-forge/docs" className="ui-link text-sm italic">{t("viewDocs")}</a>
      </PageHeader>

      <Card className="p-6 border-gold/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <SubLabel className="mb-3">{t("quickActions")}</SubLabel>
            <div className="flex flex-wrap gap-2">
              <Button onClick={applyExample} className="px-4 text-xs font-bold uppercase tracking-widest">{t("useExample")}</Button>
              <Button onClick={clearFlavor} className="px-4 text-xs font-bold uppercase tracking-widest">{t("clearFlavor")}</Button>
              <Button onClick={clearCrafting} className="px-4 text-xs font-bold uppercase tracking-widest">{t("clearCrafting")}</Button>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group" title="Prevent item type changes from overwriting the bonuses you've already set">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
              checked={lockMechanics}
              onChange={(e) => setLockMechanics(e.target.checked)}
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("itemNamePlaceholder")} />
        </FormField>

        <FormField label={t("itemType")}>
          <Select value={type} onChange={(e) => setType(e.target.value as ItemType)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>

        <FormField label={t("recommendedLevel")}>
          <Input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </FormField>

        <FormField label={t("effectiveAgainst")} sublabel={t("optional")}>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={t("effectiveAgainstPlaceholder")} />
            <Button onClick={addTag} className="px-4 text-xs font-bold">{t("add")}</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_TARGETS.map((target) => (
              <ToggleChip key={target} isActive={targets.includes(target)} onClick={() => addTarget(target)} size="xs">
                {target}
              </ToggleChip>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 min-h-6">
            {targets.map((target) => (
              <Tag key={target} onRemove={() => removeTag(target)}>{target}</Tag>
            ))}
          </div>
        </FormField>

        <div className="lg:col-span-2">
          <SubLabel>{t("flavorCrafting")}</SubLabel>
        </div>

        <FormField label={t("craftingIngredients")} sublabel={t("optional")}>
          <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1.5fr_0.6fr_0.7fr_auto]">
            <Input value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} placeholder={t("ingredientNamePlaceholder")} />
            <Input type="number" value={ingredientQty} onChange={(e) => setIngredientQty(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("qtyPlaceholder")} />
            <Input value={ingredientUnit} onChange={(e) => setIngredientUnit(e.target.value)} placeholder={t("unitPlaceholder")} />
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
            {ingredients.map((ingredient, index) => (
              <Tag key={`${ingredient.name}-${index}`} onRemove={() => removeIngredient(index)}>
                {ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} {ingredient.name}
              </Tag>
            ))}
          </div>
        </FormField>

        <FormField label={t("craftingCost")} sublabel={t("optional")}>
          <Input type="number" value={craftingCost} onChange={(e) => setCraftingCost(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("craftingCostPlaceholder")} />
        </FormField>

        <FormField label={t("craftingTime")} sublabel={t("optional")}>
          <div className="grid gap-2 grid-cols-1 lg:grid-cols-[1fr_1fr]">
            <Input type="number" value={craftingTime} onChange={(e) => setCraftingTime(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("craftingTimePlaceholder")} />
            <Select value={craftingTimeUnit} onChange={(e) => setCraftingTimeUnit(e.target.value as "hours" | "days" | "weeks")}>
              <option value="hours">{t("hours")}</option>
              <option value="days">{t("days")}</option>
              <option value="weeks">{t("weeks")}</option>
            </Select>
          </div>
        </FormField>

        <FormField label={t("craftingRequirement")} sublabel={t("optional")}>
          <Input value={craftingRequirement} onChange={(e) => setCraftingRequirement(e.target.value)} placeholder={t("craftingRequirementPlaceholder")} />
        </FormField>

        <FormField
          label={t("itemLore")}
          sublabel={t("loreWordCount", { count: loreWordCount })}
        >
          <Textarea
            value={lore}
            onChange={(e) => handleLoreChange(e.target.value)}
            placeholder={t("lorePlaceholder")}
            rows={4}
          />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
            checked={attunement}
            onChange={(e) => setAttunement(e.target.checked)}
          />
          <span className="text-sm font-medium uppercase tracking-widest text-muted group-hover:text-gold transition-colors">{t("requiresAttunement")}</span>
        </label>
      </div>

      <Button
        variant="primary"
        onClick={scrollToOutput}
        className="w-full lg:w-auto px-10 py-3 uppercase tracking-widest font-serif"
      >
        {t("viewItemBlueprint")}
      </Button>

      <ItemPreviewCard ref={outputRef} item={item} />

      <div className="flex flex-col lg:flex-row gap-4">
        <Button
          variant="primary"
          onClick={() => exportItem(item, item.name || "artifact", "png")}
          className="flex-1"
        >
          {t("downloadPng")}
        </Button>
        <Button
          variant="primary"
          onClick={() => exportItem(item, item.name || "artifact", "pdf")}
          className="flex-1"
        >
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
