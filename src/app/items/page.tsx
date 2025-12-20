"use client";

import { useMemo, useState } from "react";
import { buildItem, ItemType } from "@/app/utils/items";

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
          <input className="ui-input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sunspear" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Item type</span>
          <select className="ui-select w-full" value={type} onChange={(e) => setType(e.target.value as ItemType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-400">Player level (tuning)</span>
          <input className="ui-input w-full" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </label>

        <div className="grid gap-1">
          <span className="text-sm text-zinc-400">Target monster tags (optional)</span>
          <div className="flex gap-2">
            <input className="ui-input w-full" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g., undead, dragon" />
            <button onClick={addTag} className="ui-button text-sm">Add</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {targets.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs">
                {t}
                <button onClick={() => removeTag(t)} className="text-zinc-400 hover:text-zinc-200">×</button>
              </span>
            ))}
          </div>
        </div>

          <label className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Requires Attunement</span>
              <input
                  type="checkbox"
                  className="accent-orange"
                  checked={attunement}
                  onChange={(e) => setAttunement(e.target.checked)}
              />
          </label>
      </div>

      <div className="neo-card p-4">
        <h2 className="mb-2 font-medium">Item Blueprint</h2>
        <div className="grid gap-1 text-sm">
          <div><span className="text-zinc-400">Name:</span> {item.name}</div>
          <div><span className="text-zinc-400">Type:</span> {item.type}</div>
          <div><span className="text-zinc-400">Rarity:</span> {item.rarity}</div>
          <div><span className="text-zinc-400">Requires Attunement:</span> {item.attunement ? 'Yes' : 'No'}</div>
          <div><span className="text-zinc-400">Level tuned:</span> {item.levelTuned}</div>
          <div><span className="text-zinc-400">Targets:</span> {item.targetTags.join(", ") || "—"}</div>
          {item.bonusToHit !== undefined && <div><span className="text-zinc-400">Bonus to hit:</span> +{item.bonusToHit}</div>}
          {item.bonusAC !== undefined && <div><span className="text-zinc-400">AC bonus:</span> +{item.bonusAC}</div>}
          {item.bonusSaveDC !== undefined && <div><span className="text-zinc-400">Save DC:</span> {item.bonusSaveDC}</div>}
          {item.avgDamageBonus !== undefined && <div><span className="text-zinc-400">Avg. damage bonus/round:</span> {item.avgDamageBonus}</div>}
          {item.notes && <div className="text-zinc-400">Notes: {item.notes}</div>}
        </div>

        <details className="mt-4 neo-card p-3">
          <summary className="cursor-pointer text-sm text-zinc-300">JSON</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-2 text-xs">{JSON.stringify(item, null, 2)}</pre>
        </details>
      </div>

      <p className="text-xs text-zinc-500">These are baseline suggestions; tweak numbers to fit your table’s tone.</p>
    </section>
  );
}
