import {ABILITY_SCORE_MODIFIERS} from "@/app/data/constants";

export function getAbilityModifier(score: number): string {
    for (const [mod, scores] of Object.entries(ABILITY_SCORE_MODIFIERS)) {
        if (scores.includes(score)) return mod;
    }
    return "0";
}

export default function StatBox({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded p-3 text-center">
            <p className="font-semibold">{label}</p>
            <p className="text-amber-400">{value} ({getAbilityModifier(Number(value))})</p>
        </div>
    );
}