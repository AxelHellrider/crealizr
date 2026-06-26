"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/app/components/atoms/Input";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";
import { formatCR } from "@/app/lib/format";

interface SoloSuggestion {
    count: number;
    cr: number;
    adjustedXP: number;
}

interface GroupMember {
    count: number;
    cr: number;
}

interface GroupSuggestion {
    members: GroupMember[];
    adjustedXP: number;
}

interface EncounterBalancerPanelProps {
    partySize: number;
    onPartySizeChange: (n: number) => void;
    avgLevel: number;
    onAvgLevelChange: (n: number) => void;
    budget: number;
    difficulty: string;
    soloSuggestions: SoloSuggestion[];
    groupSuggestions: GroupSuggestion[];
    onClose: () => void;
}

export function EncounterBalancerPanel({
    partySize, onPartySizeChange,
    avgLevel, onAvgLevelChange,
    budget, difficulty,
    soloSuggestions, groupSuggestions,
    onClose,
}: EncounterBalancerPanelProps) {
    const t = useTranslations("travelEncounters");

    return (
        <div className="grid gap-6">
            <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                <h3 className="font-serif text-lg accent-gold uppercase tracking-wide">{t("encounterBalancer")}</h3>
                <button
                    onClick={onClose}
                    className="text-[10px] text-muted hover:text-gold transition-colors uppercase tracking-widest font-bold"
                >
                    {t("close")}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <FormField label={t("partySize")}>
                    <Input
                        type="number"
                        min={1}
                        value={partySize}
                        onChange={(e) => onPartySizeChange(+e.target.value)}
                        aria-label="Party size"
                    />
                </FormField>
                <FormField label={t("avgLevel")}>
                    <Input
                        type="number"
                        min={1}
                        max={20}
                        value={avgLevel}
                        onChange={(e) => onAvgLevelChange(+e.target.value)}
                        aria-label="Average Level"
                    />
                </FormField>
            </div>

            <div className="text-sm font-medium uppercase tracking-widest">
                {t("targetBudget")}: <span className="accent-gold font-bold">{budget.toLocaleString()} XP</span>{" "}
                <span className="text-muted font-normal italic">({difficulty})</span>
            </div>

            <div className="grid gap-4">
                <SubLabel>{t("soloSuggestions")}</SubLabel>
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
                    {soloSuggestions.slice(0, 4).map((s, i) => (
                        <Card key={i} className="p-4 border border-gold/10 bg-background/50">
                            <div className="font-serif text-lg accent-gold">{s.count} × CR {formatCR(s.cr)}</div>
                            <div className="text-muted text-[10px] font-bold uppercase tracking-widest mt-1">{s.adjustedXP} XP</div>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                <SubLabel variant="muted">{t("groupSuggestions")}</SubLabel>
                <div className="grid gap-3">
                    {groupSuggestions.slice(0, 2).map((g, i) => (
                        <Card key={i} className="p-4 border border-silver/10 bg-background/50 flex justify-between items-center">
                            <div className="font-serif">
                                {g.members.map((m, idx) => (
                                    <span key={idx}>
                                        <span className="font-bold text-lg accent-gold">{m.count}</span>
                                        <span className="text-muted mx-1 font-sans italic">×</span>
                                        <span className="text-foreground text-base">CR {formatCR(m.cr)}</span>
                                        {idx < g.members.length - 1 && <span className="text-gold/30 mx-3">|</span>}
                                    </span>
                                ))}
                            </div>
                            <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{g.adjustedXP} XP</span>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
