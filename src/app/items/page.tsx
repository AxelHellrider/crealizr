"use client";

import { useMemo, useState } from "react";
import { buildItem, ItemType } from "@/app/utils/items";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";

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
    <section className="grid gap-6 glass-panel p-6">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Magic Item Creator</h1>
          <p className="text-zinc-400">Design a balanced item tuned to your party level and target foes.</p>
        </div>
        <a href="/items/docs" className="ui-link text-sm">How it works</a>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Item name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sunspear" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Item type</span>
          <Select value={type} onChange={(e) => setType(e.target.value as ItemType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Player level (tuning)</span>
          <Input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </label>

        <div className="grid gap-1">
          <span className="text-sm text-zinc-400">Target monster tags (optional)</span>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g., undead, dragon" />
            <Button onClick={addTag} className="text-sm px-4">Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 min-h-[24px]">
            {targets.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-xs">
                {t}
                <button onClick={() => removeTag(t)} className="text-zinc-400 hover:text-red-400 ml-1 transition-colors">×</button>
              </span>
            ))}
          </div>
        </div>

          <label className="flex items-center gap-3 cursor-pointer group">
              <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500/20 accent-orange"
                  checked={attunement}
                  onChange={(e) => setAttunement(e.target.checked)}
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Requires Attunement</span>
          </label>
      </div>

      <div className="neo-card p-4">
        <h2 className="mb-3 font-medium border-b border-zinc-800 pb-2">Item Blueprint</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Name:</span> <span className="font-medium">{item.name || "—"}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Type:</span> <span className="font-medium">{item.type}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Rarity:</span> <span className="font-medium text-purple-400">{item.rarity}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Attunement:</span> <span className="font-medium">{item.attunement ? 'Yes' : 'No'}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Level tuned:</span> <span className="font-medium">{item.levelTuned}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Targets:</span> <span className="font-medium">{item.targetTags.join(", ") || "—"}</span></div>
          {item.bonusToHit !== undefined && <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Bonus to hit:</span> <span className="font-medium text-teal-400">+{item.bonusToHit}</span></div>}
          {item.bonusAC !== undefined && <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">AC bonus:</span> <span className="font-medium text-teal-400">+{item.bonusAC}</span></div>}
          {item.bonusSaveDC !== undefined && <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Save DC:</span> <span className="font-medium text-teal-400">{item.bonusSaveDC}</span></div>}
          {item.avgDamageBonus !== undefined && <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-400">Avg. damage bonus:</span> <span className="font-medium text-orange-400">{item.avgDamageBonus}</span></div>}
        </div>
        
        {item.notes && (
          <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-sm italic text-zinc-300">
             {item.notes}
          </div>
        )}

        <details className="mt-4 neo-card bg-black/20 border-white/5 overflow-hidden">
          <summary className="cursor-pointer p-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest font-bold">Raw JSON Data</summary>
          <pre className="p-4 overflow-x-auto text-[10px] text-teal-500/80 leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
        </details>
      </div>

      <p className="text-xs text-zinc-500">These are baseline suggestions; tweak numbers to fit your table’s tone.</p>
    </section>
  );
}
