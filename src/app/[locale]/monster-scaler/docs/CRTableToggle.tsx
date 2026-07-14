import { formatCR } from "@/app/lib/format";
import { CR_MATRIX } from "@/app/data/constants";

// Column headers are kept in English — basic D&D/5e terminology stays universal across locales.
export function CRTableToggle() {
    return (
        <div className="overflow-x-auto border border-gold/20 bg-background text-sm mt-4">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-gold/20">
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Challenge Rating</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Proficiency Bonus</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Armor Class</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Hit Points</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Attack Bonus</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Damage per Round</th>
                        <th className="px-2 py-2 text-gold/80 text-xs uppercase tracking-widest font-bold">Save DC</th>
                    </tr>
                </thead>
                <tbody>
                    {CR_MATRIX.map((row, i) => (
                        <tr key={i} className={`border-b border-gold/5 ${i % 2 === 0 ? "bg-gold/5" : ""}`}>
                            <td className="px-2 py-1 text-center">{formatCR(row.cr)}</td>
                            <td className="px-2 py-1 text-center">{row.pb}</td>
                            <td className="px-2 py-1 text-center">{row.ac}</td>
                            <td className="px-2 py-1 text-center">{row.hp}</td>
                            <td className="px-2 py-1 text-center">{row.atkb}</td>
                            <td className="px-2 py-1 text-center">{row.dpr.min}–{row.dpr.max}</td>
                            <td className="px-2 py-1 text-center">{row.save_dc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
