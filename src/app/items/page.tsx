"use client";

import { useMemo, useState } from "react";
import { buildItem, ItemType } from "@/app/utils/items";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card, CardContent } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";

const TYPES: ItemType[] = ["Weapon", "Armor", "Wand", "Wondrous"];

export default function ItemCreatorPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("Weapon");
  const [attunement, setAttunement] = useState(false);
  const [level, setLevel] = useState(5);
  const [targets, setTargets] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const item = useMemo(() => buildItem({ name, type, attunement, level, targets }), [name, type, attunement, level, targets]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!targets.includes(t)) setTargets((arr) => [...arr, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTargets((arr) => arr.filter((x) => x !== t));

  return (
    <section className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Item Creator</h1>
          <p className="text-muted mt-2 font-light italic">Design custom magic items and artifacts for your campaign.</p>
        </div>
        <a href="/items/docs" className="ui-link text-sm italic">View Documentation</a>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
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

        <FormField label="Special Properties" sublabel="Optional">
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g., undead, dragon" />
            <Button onClick={addTag} className="px-4 text-xs font-bold">ADD</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 min-h-[24px]">
            {targets.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-sm border border-gold/20 bg-gold/5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest accent-gold shadow-glow">
                {t}
                <button onClick={() => removeTag(t)} className="text-gold/40 hover:text-red-400 ml-2 transition-colors text-base leading-none">×</button>
              </span>
            ))}
          </div>
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

      <Card className="p-8 border-gold/10">
        <h2 className="mb-6 font-serif text-2xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">Item Properties</h2>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Name:</span> <span className="font-serif text-lg accent-gold">{item.name || "—"}</span></div>
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Type:</span> <span className="font-medium">{item.type}</span></div>
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Rarity:</span> <span className="font-bold text-blue-400 uppercase tracking-widest">{item.rarity}</span></div>
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Attunement:</span> <span className="font-medium">{item.attunement ? 'Required' : 'None'}</span></div>
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Tier:</span> <span className="font-medium italic">Tier {item.levelTuned}</span></div>
          <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Special:</span> <span className="font-medium text-silver">{item.targetTags.join(", ") || "None"}</span></div>
          {item.bonusToHit !== undefined && <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">To Hit:</span> <span className="font-bold text-gold">+{item.bonusToHit}</span></div>}
          {item.bonusAC !== undefined && <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">AC Bonus:</span> <span className="font-bold text-blue-300">+{item.bonusAC}</span></div>}
          {item.bonusSaveDC !== undefined && <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Save DC:</span> <span className="font-bold text-purple-400">+{item.bonusSaveDC}</span></div>}
          {item.avgDamageBonus !== undefined && <div className="flex justify-between border-b border-gold/5 pb-2"><span className="font-bold uppercase tracking-widest text-muted text-[10px]">Damage Bonus:</span> <span className="font-bold text-red-400">+{item.avgDamageBonus} avg</span></div>}
        </CardContent>
        
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
    </section>
  );
}
