import React from "react";
import { ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
type AbilityKey = typeof ABILITY_KEYS[number];

type AbilityScores = Partial<Record<AbilityKey, number>> & Record<string, unknown>;

function getModifier(score: number): string {
    for (const [mod, scores] of Object.entries(ABILITY_SCORE_MODIFIERS)) {
        if ((scores as number[]).includes(score)) return mod;
    }
    return "0";
}

interface AbilityScoreDisplayProps {
    stats: AbilityScores;
    labels?: Partial<Record<AbilityKey, string>>;
}

export function AbilityScoreDisplay({ stats, labels = {} }: AbilityScoreDisplayProps) {
    return (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {ABILITY_KEYS.map((key) => {
                const value = Number(stats[key] ?? 10);
                return (
                    <div key={key} className="text-center p-3 border border-gold/10 bg-gold/5 rounded-sm">
                        <div className="text-[10px] uppercase text-gold font-bold tracking-widest mb-1">
                            {labels[key] ?? key}
                        </div>
                        <div className="text-lg font-bold">{value}</div>
                        <div className="text-xs text-muted italic">({getModifier(value)})</div>
                    </div>
                );
            })}
        </div>
    );
}
