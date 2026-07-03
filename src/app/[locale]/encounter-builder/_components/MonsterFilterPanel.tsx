"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { Terrain, Affiliation } from "@/app/types/monster";
import { Input } from "@/app/components/atoms/Input";
import { SubLabel } from "@/app/components/atoms/SubLabel";
import { FormField } from "@/app/components/molecules/FormField";
import { ToggleChip } from "@/app/components/molecules/ToggleChip";
import { Card } from "@/app/components/atoms/Card";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";

export type RelationCriteria = "terrain" | "affiliation" | "genus" | "any";

const TERRAINS: Terrain[] = ["dungeon", "wilderness", "urban", "underwater", "planar"];
const AFFILIATIONS: Affiliation[] = [
    "humanoid", "beast", "undead", "construct", "dragon", "fiend",
    "celestial", "fey", "monstrosity", "giant", "elemental", "aberration", "plant",
];

interface MonsterFilterPanelProps {
    relationCriteria: RelationCriteria;
    onRelationChange: (v: RelationCriteria) => void;
    filterTerrain: Terrain | "";
    onTerrainChange: (v: Terrain | "") => void;
    filterAffiliation: Affiliation | "";
    onAffiliationChange: (v: Affiliation | "") => void;
    filterGenus: string;
    onGenusChange: (v: string) => void;
    knownGenera: string[];
}

export function MonsterFilterPanel({
    relationCriteria, onRelationChange,
    filterTerrain, onTerrainChange,
    filterAffiliation, onAffiliationChange,
    filterGenus, onGenusChange,
    knownGenera,
}: MonsterFilterPanelProps) {
    const t = useTranslations("encounterBuilder");

    const handleRelationChange = (v: RelationCriteria) => {
        onRelationChange(v);
        onTerrainChange("");
        onAffiliationChange("");
        onGenusChange("");
    };

    return (
        <Card className="p-6 border-gold/10">
            <SectionHeader>Monster Filter</SectionHeader>

            <div className="mb-4">
                <SubLabel className="mb-3">{t("relationCriteria")}</SubLabel>
                <div className="flex flex-wrap gap-2">
                    {([
                        { value: "any" as const, label: t("anySpecies") },
                        { value: "terrain" as const, label: t("sameTerrain") },
                        { value: "affiliation" as const, label: t("sameAffiliation") },
                        { value: "genus" as const, label: t("sameGenus") },
                    ]).map(({ value, label }) => (
                        <ToggleChip key={value} isActive={relationCriteria === value} onClick={() => handleRelationChange(value)}>
                            {label}
                        </ToggleChip>
                    ))}
                </div>
            </div>

            {relationCriteria === "terrain" && (
                <div>
                    <SubLabel variant="muted" className="mb-2">{t("sameTerrain")}</SubLabel>
                    <div className="flex flex-wrap gap-2">
                        {TERRAINS.map((ter) => (
                            <ToggleChip key={ter} isActive={filterTerrain === ter} onClick={() => onTerrainChange(filterTerrain === ter ? "" : ter)}>
                                {ter}
                            </ToggleChip>
                        ))}
                    </div>
                    {!filterTerrain && <p className="text-xs text-muted italic mt-2">Select a terrain to filter the monster pool below.</p>}
                </div>
            )}

            {relationCriteria === "affiliation" && (
                <div>
                    <SubLabel variant="muted" className="mb-2">{t("sameAffiliation")}</SubLabel>
                    <div className="flex flex-wrap gap-2">
                        {AFFILIATIONS.map((a) => (
                            <ToggleChip key={a} isActive={filterAffiliation === a} onClick={() => onAffiliationChange(filterAffiliation === a ? "" : a)}>
                                {a}
                            </ToggleChip>
                        ))}
                    </div>
                    {!filterAffiliation && <p className="text-xs text-muted italic mt-2">Select an affiliation to filter the monster pool below.</p>}
                </div>
            )}

            {relationCriteria === "genus" && (
                <div>
                    <FormField label={t("sameGenus")} sublabel="type or pick">
                        <Input
                            value={filterGenus}
                            onChange={(e) => onGenusChange(e.target.value)}
                            list="encounter-genus-options"
                            placeholder="e.g. dragon, goblinoid"
                        />
                    </FormField>
                    <datalist id="encounter-genus-options">
                        {knownGenera.map((g) => <option key={g} value={g} />)}
                    </datalist>
                    {knownGenera.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {knownGenera.map((g) => (
                                <ToggleChip key={g} size="xs" isActive={filterGenus === g} onClick={() => onGenusChange(filterGenus === g ? "" : g)}>
                                    {g}
                                </ToggleChip>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
