"use client";

import { useState } from "react";
import { listMonsters } from "@/app/data/monsters";
import type { MonsterBase } from '@/app/types/monsters_schema';

export default function MonstersPage() {
    const [query, setQuery] = useState("");
    const [edition, setEdition] = useState<"2014" | "2024">("2014");

    const monsters: MonsterBase[] = listMonsters(edition);
    const filtered = monsters.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <section className="w-full flex flex-col px-6 py-20 text-white relative">
            {/* Arcane glow backdrop */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute -top-10 left-1/3 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-purple-600 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-center">Monster Index</h1>

                <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10">
                    Browse monsters from the {edition} edition. Upscale, downscale, or analyze any of them with CRializr.
                </p>

                {/* Edition Switch */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => setEdition("2014")}
                        className={`px-4 py-2 rounded border ${
                            edition === "2014" ? "border-amber-500 bg-zinc-800" : "border-zinc-700 bg-zinc-900"
                        }`}
                    >
                        2014
                    </button>
                    <button
                        onClick={() => setEdition("2024")}
                        className={`px-4 py-2 rounded border ${
                            edition === "2024" ? "border-amber-500 bg-zinc-800" : "border-zinc-700 bg-zinc-900"
                        }`}
                    >
                        2024
                    </button>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-xl mx-auto mb-14">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search monsters..."
                        className="
              w-full rounded-lg px-4 py-3 bg-zinc-900
              border border-zinc-700
              focus:border-amber-500 focus:ring-amber-500
              transition
            "
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    <button className="px-4 py-2 rounded bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 transition">
                        CR 0–2
                    </button>
                    <button className="px-4 py-2 rounded bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 transition">
                        CR 3–8
                    </button>
                    <button className="px-4 py-2 rounded bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 transition">
                        CR 9–16
                    </button>
                    <button className="px-4 py-2 rounded bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 transition">
                        CR 17+
                    </button>
                </div>

                {/* Monster List */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 && (
                        <p className="text-center text-zinc-500 col-span-full">
                            No monsters found.
                        </p>
                    )}

                    {filtered.map((m) => (
                        <a
                            key={m.name}
                            href={`/monsters/${m.name.toLowerCase().replace(/ /g, "-")}`}
                            className="
                block p-5 rounded-xl
                bg-gradient-to-b from-zinc-900 to-zinc-950
                border border-zinc-800
                hover:border-amber-500 hover:shadow-amber-500/20
                hover:shadow-xl
                transition
              "
                        >
                            <h2 className="text-lg font-semibold mb-1">{m.name}</h2>
                            <p className="text-sm text-zinc-400">{m.type}</p>

                            <p className="mt-3 text-amber-400 font-bold text-sm">
                                CR {m.challenge_rating}
                            </p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
