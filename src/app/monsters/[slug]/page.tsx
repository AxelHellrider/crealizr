"use client";

import StatBox from "@/app/components/monsters/StatBox";
import {useState, useMemo, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {listMonsters} from "@/app/data/monsters";
import type {MonsterBase} from "@/app/types/monsters_schema";
import {scaleMonster2014} from "@/app/utils/scaler";
import {CR_VALUES} from "@/app/data/constants";

export default function MonsterDetail() {
    const {slug} = useParams();
    const [edition, setEdition] = useState<"2014" | "2024">("2014");
    const [targetCR, setTargetCR] = useState<number | null>(null);
    const [formula, setFormula] = useState<"2014" | "2024" | "custom">("2014");

    const monsters: MonsterBase[] = listMonsters(edition);
    const monster = monsters.find(
        (m) => m.name.toLowerCase().replace(/ /g, "-") === slug
    );

    const router = useRouter();

    // Live scaled monster
    const scaledMonster = useMemo(() => {
        if (!monster || targetCR === null) return monster;
        return scaleMonster2014(monster, targetCR);
    }, [monster, targetCR]);


    if (!monster) {
        return (
            <section className="w-full flex items-center justify-center py-40 text-white">
                <p>Monster not found.</p>
            </section>
        );
    }

    return (
        <section className="w-full px-6 py-20 text-white relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="bg-transparent border border-teal-600 px-3 py-1 rounded-lg text-zinc-300 hover:text-white hover:border-white transition flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <h1 className="text-4xl font-bold">{monster.name}</h1>
                    <div className="flex gap-4">
                        <span className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700">
                          {monster.type}
                        </span>
                        <span className="px-3 py-1 rounded bg-amber-600">
                          CR {scaledMonster?.challenge_rating ?? monster.challenge_rating}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded p-3 text-center">
                        <p className="font-semibold">AC</p>
                        <p className="text-amber-400">{scaledMonster?.stats.ac ?? monster.stats.ac}</p>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded p-3 text-center">
                        <p className="font-semibold">HP</p>
                        <p className="text-amber-400">{scaledMonster?.stats.hp ?? monster.stats.hp}</p>
                    </div>
                    <StatBox label="STR" value={scaledMonster?.stats.str ?? monster.stats.str}/>
                    <StatBox label="DEX" value={scaledMonster?.stats.dex ?? monster.stats.dex}/>
                    <StatBox label="CON" value={scaledMonster?.stats.con ?? monster.stats.con}/>
                    <StatBox label="INT" value={scaledMonster?.stats.int ?? monster.stats.int}/>
                    <StatBox label="WIS" value={scaledMonster?.stats.wis ?? monster.stats.wis}/>
                    <StatBox label="CHA" value={scaledMonster?.stats.cha ?? monster.stats.cha}/>
                </div>

                {/* Traits */}
                {monster.traits?.length ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Traits</h2>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                            {monster.traits.map((t) => (
                                <li key={t.name}>
                                    <strong>{t.name}:</strong> {t.desc}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {/* Actions */}
                {monster.actions?.length ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Actions</h2>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                            {monster.actions.map((a) => (
                                <li key={a.name}>
                                    <strong>{a.name}:</strong> {a.damage}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {/* Legendary Actions */}
                {monster.legendary_actions?.length ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Legendary Actions</h2>
                        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                            {monster.legendary_actions.map((a) => (
                                <li key={a.name}>
                                    <strong>{a.name}:</strong> {a.desc}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {/* CR Scaling */}
                <div className="mt-10 p-6 bg-zinc-900 rounded-xl border border-zinc-700 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <label htmlFor="edition">Edition:</label>
                        <select
                            id="edition"
                            value={edition}
                            onChange={(e) => setEdition(e.target.value as "2014" | "2024")}
                            className="bg-zinc-800 border border-zinc-600 px-3 py-2 rounded"
                        >
                            <option value="2014">2014 DMG</option>
                            <option value="2024">2024 DMG</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <label htmlFor="formula">Formula:</label>
                        <select
                            id="formula"
                            value={formula}
                            onChange={(e) => setFormula(e.target.value as "2014" | "2024" | "custom")}
                            className="bg-zinc-800 border border-zinc-600 px-3 py-2 rounded"
                        >
                            <option value="2014">2014 DMG</option>
                            <option value="2024">2024 DMG</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <label htmlFor="targetCR">Target CR:</label>
                        <select
                            id="targetCR"
                            value={targetCR ?? 0}
                            onChange={(e) => setTargetCR(Number(e.target.value))}
                            className="bg-zinc-800 border border-zinc-600 px-3 py-2 rounded"
                        >
                            <option value="" disabled>Select CR</option>
                            {CR_VALUES.map(cr => (
                                <option key={cr} value={cr}>
                                    {cr === 0.125 ? "1/8" :
                                        cr === 0.25 ? "1/4" :
                                            cr === 0.5 ? "1/2" :
                                                cr}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </section>
    );
}
