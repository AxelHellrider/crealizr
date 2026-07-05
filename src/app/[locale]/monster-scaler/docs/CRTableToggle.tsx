"use client";

import { useState } from "react";
import { formatCR } from "@/app/lib/format";
import { CR_MATRIX } from "@/app/data/constants";
import { CR_MATRIX_2024 } from "@/app/data/constants2024";

function CRTable({ data }: { data: typeof CR_MATRIX }) {
    return (
        <div className="overflow-x-auto rounded bg-black/30 p-4 text-sm">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-black/50">
                    <tr>
                        <th className="px-2 py-1">Challenge Rating</th>
                        <th className="px-2 py-1">Proficiency Bonus</th>
                        <th className="px-2 py-1">Armor Class</th>
                        <th className="px-2 py-1">Hit Points</th>
                        <th className="px-2 py-1">Attack Bonus</th>
                        <th className="px-2 py-1">Damage per Round</th>
                        <th className="px-2 py-1">Save DC</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white/20" : "bg-white/10"}>
                            <td className="px-2 py-1 text-center">{formatCR(row.cr)}</td>
                            <td className="px-2 py-1 text-center">{row.pb}</td>
                            <td className="px-2 py-1 text-center">{row.ac}</td>
                            <td className="px-2 py-1 text-center">{row.hp}</td>
                            <td className="px-2 py-1 text-center">{row.atkb}</td>
                            <td className="px-2 py-1 text-center">{row.dpr}</td>
                            <td className="px-2 py-1 text-center">{row.save_dc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function CRTableToggle() {
    const [edition, setEdition] = useState<"2014" | "2024">("2014");
    return (
        <>
            <div className="flex gap-4 mt-4">
                <button
                    className={`px-4 py-1 rounded ${edition === "2014" ? "bg-amber-500 text-black" : "bg-black/40"}`}
                    onClick={() => setEdition("2014")}
                >
                    2014 Edition
                </button>
                <button
                    className={`px-4 py-1 rounded ${edition === "2024" ? "bg-amber-500 text-black" : "bg-black/40"}`}
                    onClick={() => setEdition("2024")}
                >
                    2024 Edition
                </button>
            </div>
            <div className="mt-6">
                {edition === "2014" ? <CRTable data={CR_MATRIX} /> : <CRTable data={CR_MATRIX_2024} />}
            </div>
        </>
    );
}
