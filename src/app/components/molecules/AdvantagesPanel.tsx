import type { CoverBenefit, CoverLevel, HazardEffect } from "@/app/types/encounterLayout";

function coverBenefitText(level: CoverLevel): string {
    switch (level) {
        case "half":          return "+2 AC & Dex saves";
        case "three-quarter": return "+5 AC & Dex saves";
        case "full":          return "Cannot be targeted";
    }
}

interface AdvantagesPanelProps {
    coverBenefits: CoverBenefit[];
    hazardEffects: HazardEffect[];
    className?: string;
}

/**
 * Party advantages (cover) / disadvantages (hazards currently affecting a
 * creature) — name only, no description text, so the list stays scannable.
 */
export function AdvantagesPanel({ coverBenefits, hazardEffects, className = "" }: AdvantagesPanelProps) {
    if (coverBenefits.length === 0 && hazardEffects.length === 0) return null;

    return (
        <div className={`pt-4 border-t border-sky-400/20 ${className}`}>
            <span className="text-xs uppercase tracking-widest text-sky-400/80 font-bold">Advantages / Disadvantages</span>
            <ul className="mt-2 flex flex-col gap-1.5">
                {coverBenefits.map((b, i) => (
                    <li key={`cover-${i}`} className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="text-foreground/80 font-medium truncate">{b.partyLabel}</span>
                        <span className="text-sky-400 shrink-0 text-right">
                            {coverBenefitText(b.coverLevel)}
                            <span className="ml-1 font-bold opacity-70">C</span>
                        </span>
                    </li>
                ))}
                {hazardEffects.map((h, i) => (
                    <li key={`hazard-${i}`} className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="text-foreground/80 font-medium truncate">
                            {h.creatureLabel}
                            <span className="ml-1.5 text-[9px] uppercase tracking-widest text-muted/60">
                                {h.creatureKind === "party" ? "PC" : "NPC"}
                            </span>
                        </span>
                        <span className={`shrink-0 text-right ${h.source === "spell" ? "text-purple-400" : "text-amber-500"}`}>
                            {h.hazardLabel}
                            <span className="ml-1 font-bold opacity-70">{h.source === "spell" ? "S" : "E"}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
