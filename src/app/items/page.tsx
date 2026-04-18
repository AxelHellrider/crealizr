"use client";

import { useMemo, useRef, useState } from "react";
import { buildItem, ItemType } from "@/app/utils/items";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card, CardContent } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";

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
    const t = tagInput.trim();
    if (!t) return;
    if (!targets.includes(t)) setTargets((arr) => [...arr, t]);
    setTagInput("");
  };

  const addTarget = (t: string) => {
    if (!targets.includes(t)) setTargets((arr) => [...arr, t]);
  };

  const removeTag = (t: string) => setTargets((arr) => arr.filter((x) => x !== t));

  const addIngredient = () => {
    const nameValue = ingredientName.trim();
    const quantityValue = typeof ingredientQty === "number" ? ingredientQty : Number(ingredientQty);
    if (!nameValue || !Number.isFinite(quantityValue) || quantityValue <= 0) return;
    setIngredients((arr) => [...arr, {
      name: nameValue,
      quantity: quantityValue,
      unit: ingredientUnit.trim() || undefined,
    }]);
    setIngredientName("");
    setIngredientQty("");
    setIngredientUnit("");
  };

  const removeIngredient = (index: number) => {
    setIngredients((arr) => arr.filter((_, i) => i !== index));
  };

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

  const clearFlavor = () => {
    setName("");
    setTargets([]);
    setLore("");
  };

  const clearCrafting = () => {
    setIngredients([]);
    setCraftingCost("");
    setCraftingTime("");
    setCraftingRequirement("");
  };

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loreWordCount = lore.trim() ? lore.trim().split(/\s+/).length : 0;
  const handleLoreChange = (value: string) => {
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    if (words.length <= 100) {
      setLore(value);
      return;
    }
    setLore(words.slice(0, 100).join(" "));
  };

  return (
    <section className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Artifact Forge</h1>
          <p className="text-muted mt-2 font-light italic">
            Craft items with balanced mechanical bonuses and a clear crafting story.
          </p>
          <WhyDifferent className="mt-3" />
        </div>
        <a href="/items/docs" className="ui-link text-sm italic hidden sm:inline-flex">View Documentation</a>
      </header>

      <Card className="p-6 border-gold/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Quick actions</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={applyExample} className="px-4 text-xs font-bold uppercase tracking-widest">Use Example</Button>
              <Button onClick={clearFlavor} className="px-4 text-xs font-bold uppercase tracking-widest">Clear Flavor</Button>
              <Button onClick={clearCrafting} className="px-4 text-xs font-bold uppercase tracking-widest">Clear Crafting</Button>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
              checked={lockMechanics}
              onChange={(e) => setLockMechanics(e.target.checked)}
            />
            <span className="text-xs font-medium uppercase tracking-widest text-muted group-hover:text-gold transition-colors">Lock Mechanics</span>
          </label>
        </div>
        <p className="mt-4 text-sm text-muted">
          Mechanical bonuses are tuned by rarity band; adjust up or down to match your table&apos;s power curve.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {EXAMPLE_ITEMS.slice(0, 3).map((example) => (
          <Card key={example.name} className="p-5 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Example</div>
            <h3 className="mt-2 font-serif text-lg accent-gold">{example.name}</h3>
            <p className="text-xs text-muted mt-1">{example.type} · Level {example.level}</p>
            <p className="text-sm text-muted mt-3 italic">&quot;{example.lore}&quot;</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">
          Mechanics
        </div>
        <FormField label="Item Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sunspear of Pelor" />
        </FormField>

        <FormField label="Item Type">
          <Select value={type} onChange={(e) => setType(e.target.value as ItemType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Recommended Level">
          <Input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </FormField>

        <FormField label="Effective Against" sublabel="Optional">
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g., undead, dragon" />
            <Button onClick={addTag} className="px-4 text-xs font-bold">ADD</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_TARGETS.map((target) => (
              <button
                key={target}
                onClick={() => addTarget(target)}
                type="button"
                className="px-3 py-1 text-[10px] uppercase tracking-widest border border-gold/20 text-gold/80 hover:text-gold transition-colors"
              >
                {target}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 min-h-6">
            {targets.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-sm border border-gold/20 bg-gold/5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest accent-gold shadow-glow">
                {t}
                <button onClick={() => removeTag(t)} className="text-gold/40 hover:text-red-400 ml-2 transition-colors text-base leading-none">×</button>
              </span>
            ))}
          </div>
        </FormField>

        <div className="sm:col-span-2 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">
          Flavor & Crafting
        </div>
        <FormField label="Crafting Ingredients" sublabel="Optional">
          <div className="grid gap-2 sm:grid-cols-[1.5fr_0.6fr_0.7fr_auto]">
            <Input value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} placeholder="Ingredient name" />
            <Input type="number" value={ingredientQty} onChange={(e) => setIngredientQty(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Qty" />
            <Input value={ingredientUnit} onChange={(e) => setIngredientUnit(e.target.value)} placeholder="Unit (optional)" />
            <Button onClick={addIngredient} className="px-4 text-xs font-bold">ADD</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_INGREDIENTS.map((ingredient) => (
              <button
                key={ingredient.name}
                onClick={() => addQuickIngredient(ingredient)}
                type="button"
                className="px-3 py-1 text-[10px] uppercase tracking-widest border border-gold/20 text-gold/80 hover:text-gold transition-colors"
              >
                {ingredient.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 min-h-6">
            {ingredients.map((ingredient, index) => (
              <span key={`${ingredient.name}-${index}`} className="inline-flex items-center gap-1 rounded-sm border border-gold/20 bg-gold/5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest accent-gold shadow-glow">
                {ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} {ingredient.name}
                <button onClick={() => removeIngredient(index)} className="text-gold/40 hover:text-red-400 ml-2 transition-colors text-base leading-none">×</button>
              </span>
            ))}
          </div>
        </FormField>

        <FormField label="Crafting Cost (gp)" sublabel="Optional">
          <Input type="number" value={craftingCost} onChange={(e) => setCraftingCost(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g., 100" />
        </FormField>

        <FormField label="Crafting Time" sublabel="Optional">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
            <Input type="number" value={craftingTime} onChange={(e) => setCraftingTime(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g., 2" />
            <Select value={craftingTimeUnit} onChange={(e) => setCraftingTimeUnit(e.target.value as "hours" | "days" | "weeks")}>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </Select>
          </div>
        </FormField>

        <FormField label="Crafting Requirement" sublabel="Optional">
          <Input value={craftingRequirement} onChange={(e) => setCraftingRequirement(e.target.value)} placeholder="e.g., must be crafted in Neverwinter or by an artificer" />
        </FormField>

        <FormField label="Item Lore" sublabel={`Optional · ${loreWordCount}/100 words`}>
          <textarea
            value={lore}
            onChange={(e) => handleLoreChange(e.target.value)}
            placeholder="Short lore or legend behind the item."
            rows={4}
            className="ui-input w-full min-h-[120px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-bg-elev border-silver/30 text-foreground"
          />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 rounded-sm border-gold/30 bg-card text-gold focus:ring-gold/20 accent-gold"
            checked={attunement}
            onChange={(e) => setAttunement(e.target.checked)}
          />
          <span className="text-sm font-medium uppercase tracking-widest text-muted group-hover:text-gold transition-colors">Requires Attunement</span>
        </label>
      </div>

      <Button
        variant="primary"
        onClick={scrollToOutput}
        className="w-full sm:w-auto px-10 py-3 uppercase tracking-widest font-serif"
      >
        View Item Blueprint
      </Button>

      <Card className="p-8 border-gold/10" ref={outputRef}>
        <h2 className="mb-6 font-serif text-2xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">Item Properties</h2>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">
          <span>Export Preview</span>
          <span className="text-muted normal-case tracking-normal">Matches JSON output.</span>
        </div>
        <div className="rounded-sm border border-gold/20 bg-gold/5 p-4 mb-6 text-sm">
          <div className="font-serif text-lg accent-gold">{item.name || "Unnamed Artifact"}</div>
          <div className="text-xs text-muted mt-1">
            {item.rarity} · {item.type} · Level {item.levelTuned} · {item.attunement ? "Attunement" : "No Attunement"}
          </div>
          <div className="mt-2 text-xs text-muted">
            {item.bonusToHit !== undefined && `+${item.bonusToHit} to hit`}
            {item.bonusAC !== undefined && `${item.bonusToHit !== undefined ? " · " : ""}+${item.bonusAC} AC`}
            {item.bonusSaveDC !== undefined && `${item.bonusToHit !== undefined || item.bonusAC !== undefined ? " · " : ""}DC ${item.bonusSaveDC}`}
            {item.avgDamageBonus !== undefined && `${item.bonusToHit !== undefined || item.bonusAC !== undefined || item.bonusSaveDC !== undefined ? " · " : ""}+${item.avgDamageBonus} avg dmg`}
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">Mechanical Summary</div>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Name:</span>
            <span className="font-serif accent-gold break-words sm:text-right">{item.name || "—"}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Type:</span>
            <span className="font-medium break-words sm:text-right">{item.type}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Rarity:</span>
            <span className="font-bold text-blue-400 uppercase tracking-widest break-words sm:text-right">{item.rarity}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Attunement:</span>
            <span className="font-medium break-words sm:text-right">{item.attunement ? 'Required' : 'None'}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Power Band:</span>
            <span className="font-medium italic break-words sm:text-right">Level {item.levelTuned}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Special:</span>
            <span className="font-medium text-silver break-words sm:text-right">{item.targetTags.join(", ") || "None"}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Craft Cost:</span>
            <span className="font-medium break-words sm:text-right">{item.craftingCost !== undefined ? `${item.craftingCost} gp` : "—"}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Craft Time:</span>
            <span className="font-medium break-words sm:text-right">{item.craftingTime !== undefined ? `${item.craftingTime} ${item.craftingTimeUnit ?? "days"}` : "—"}</span>
          </div>
          {item.bonusToHit !== undefined && (
            <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold uppercase tracking-widest text-muted text-[10px]">To Hit:</span>
              <span className="font-bold text-gold break-words sm:text-right">+{item.bonusToHit}</span>
            </div>
          )}
          {item.bonusAC !== undefined && (
            <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold uppercase tracking-widest text-muted text-[10px]">AC Bonus:</span>
              <span className="font-bold text-blue-300 break-words sm:text-right">+{item.bonusAC}</span>
            </div>
          )}
          {item.bonusSaveDC !== undefined && (
            <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Save DC:</span>
              <span className="font-bold text-purple-400 break-words sm:text-right">DC {item.bonusSaveDC}</span>
            </div>
          )}
          {item.avgDamageBonus !== undefined && (
            <div className="flex min-w-0 flex-col gap-1 border-b border-gold/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Damage Bonus:</span>
              <span className="font-bold text-red-400 break-words sm:text-right">+{item.avgDamageBonus} avg</span>
            </div>
          )}
        </CardContent>

        <div className="mt-8 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">Lore & Crafting</div>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-2 border-b border-gold/5 pb-2">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Ingredients:</span>
            <span className="font-medium text-silver break-words">
              {item.ingredients.length
                ? item.ingredients.map((ingredient) => `${ingredient.quantity}${ingredient.unit ? ` ${ingredient.unit}` : ""} ${ingredient.name}`).join(", ")
                : "None"}
            </span>
          </div>
          <div className="flex flex-col gap-2 border-b border-gold/5 pb-2">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Crafting Requirement:</span>
            <span className="font-medium text-silver break-words">{item.craftingRequirement || "None"}</span>
          </div>
          <div className="flex flex-col gap-2 border-b border-gold/5 pb-2 sm:col-span-2">
            <span className="font-bold uppercase tracking-widest text-muted text-[10px]">Lore:</span>
            <span className="font-medium text-silver break-words">{item.lore || "None"}</span>
          </div>
        </div>
        
        {item.notes && (
          <div className="mt-8 p-6 bg-gold/5 rounded-sm border border-gold/20 text-base italic text-muted-foreground font-serif leading-relaxed">
             &quot;{item.notes}&quot;
          </div>
        )}

        <details className="mt-8 neo-card bg-background/40 border-gold/10 overflow-hidden">
          <summary className="cursor-pointer p-4 text-[10px] text-muted hover:text-gold transition-colors uppercase tracking-[0.2em] font-bold">Item Metadata (JSON)</summary>
          <pre className="p-6 overflow-x-auto text-[10px] text-blue-400/80 leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
        </details>
      </Card>

      <p className="text-xs text-muted italic text-center">These suggestions provide a balanced baseline; adjust properties to fit your campaign&apos;s power level.</p>

      <div className="sm:hidden pt-4">
        <a href="/items/docs" className="ui-link text-sm italic inline-flex justify-center w-full">View Documentation</a>
      </div>
    </section>
  );
}
