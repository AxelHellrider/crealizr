"use client";

import { Input } from "@/app/components/atoms/Input";

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = typeof ABILITY_KEYS[number];
export type AbilityScores = Record<AbilityKey, number>;

function modifier(score: number): string {
    const mod = Math.floor((score - 10) / 2);
    return `${mod >= 0 ? "+" : ""}${mod}`;
}

interface AbilityScoreGridProps {
    values: AbilityScores;
    onChange: (key: AbilityKey, value: number) => void;
    labels?: Partial<Record<AbilityKey, string>>;
}

export function AbilityScoreGrid({ values, onChange, labels = {} }: AbilityScoreGridProps) {
    return (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {ABILITY_KEYS.map((key) => (
                <div key={key} className="text-center p-3 border border-gold/10 bg-gold/5 rounded-sm">
                    <div className="text-[10px] uppercase text-gold font-bold tracking-widest mb-2">
                        {labels[key] ?? key}
                    </div>
                    <Input
                        type="number"
                        value={values[key]}
                        onChange={(e) => onChange(key, Math.max(0, Math.min(30, Number(e.target.value))))}
                        min={0}
                        max={30}
                        numpadLabel={labels[key] ?? key}
                        className="text-center text-lg font-bold bg-transparent border-0 shadow-none focus:ring-0 focus:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <div className="text-xs text-muted italic">({modifier(values[key])})</div>
                </div>
            ))}
        </div>
    );
}
