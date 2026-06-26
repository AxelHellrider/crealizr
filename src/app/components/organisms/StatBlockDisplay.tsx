"use client";

import React, { forwardRef } from "react";
import type { MonsterBase } from "@/app/types/monster";
import { formatCR } from "@/app/lib/format";
import { AbilityScoreDisplay } from "@/app/components/molecules/AbilityScoreDisplay";

interface StatBlockLabels {
    fallbackName?: string;
    armorClass?: string;
    hitPoints?: string;
    speed?: string;
    challengeRating?: string;
    suggestedDamagePerRound?: string;
}

interface StatBlockDisplayProps {
    monster: MonsterBase;
    labels?: StatBlockLabels;
    className?: string;
}

export const StatBlockDisplay = forwardRef<HTMLDivElement, StatBlockDisplayProps>(
    ({ monster, labels = {}, className = "" }, ref) => {
        const l: Required<StatBlockLabels> = {
            fallbackName: labels.fallbackName ?? "Scaled Monster",
            armorClass: labels.armorClass ?? "Armor Class",
            hitPoints: labels.hitPoints ?? "Hit Points",
            speed: labels.speed ?? "Speed",
            challengeRating: labels.challengeRating ?? "Challenge Rating",
            suggestedDamagePerRound: labels.suggestedDamagePerRound ?? "Suggested Damage/Round",
        };

        return (
            <div
                ref={ref}
                data-export-statblock="true"
                className={`neo-card p-10 fantasy-border shadow-2xl relative overflow-hidden bg-card ${className}`}
            >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
                <h1 className="text-4xl font-serif pb-4 border-b border-gold/30 mb-6 accent-gold uppercase tracking-tighter">
                    {monster.name || l.fallbackName}
                </h1>
                <div className="grid gap-1 mb-6 italic text-muted font-serif">
                    <div>{monster.size} {monster.type}, {monster.alignment}</div>
                </div>

                <div className="grid gap-3 border-y border-gold/20 py-6 mb-8">
                    {[
                        { label: l.armorClass, value: monster.stats.ac },
                        { label: l.hitPoints, value: monster.stats.hp },
                        { label: l.speed, value: monster.stats.speed },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm">{label}</span>
                            <span className="text-xl font-bold">{value}</span>
                        </div>
                    ))}
                </div>

                <div className="mb-10">
                    <AbilityScoreDisplay stats={monster.stats} />
                </div>

                <div className="grid gap-3">
                    <div className="flex justify-between items-baseline border-b border-gold/20 pb-2">
                        <span className="font-serif uppercase tracking-widest text-gold/80 text-sm">{l.challengeRating}</span>
                        <span className="text-lg font-bold">
                            {formatCR(monster.cr)}
                            <span className="text-muted text-xs ml-1 font-sans">({monster.edition} Ruleset)</span>
                        </span>
                    </div>
                    {monster.dpr && (
                        <div className="flex justify-between items-baseline border-b border-gold/20 pb-2">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm">{l.suggestedDamagePerRound}</span>
                            <span className="text-lg font-bold">{monster.dpr.range}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
StatBlockDisplay.displayName = "StatBlockDisplay";
