"use client";

import { useState, useTransition, useMemo } from "react";
import { useMergedCatalog } from "@/app/hooks/useMergedCatalog";
import { scaleMonster, type ScaleOptions } from "@/app/services/scalerService";
import type { MonsterBase, Edition } from "@/app/types/monster";

const DEFAULT_MONSTER: MonsterBase = {
    name: "",
    edition: "2014",
    size: "Medium",
    type: "",
    dpr: { min: 1, max: 1, range: "" },
    alignment: "Unaligned",
    cr: 0.125,
    terrain: ["any"],
    affiliation: "any",
    xp: 0,
    stats: { ac: 10, hp: 1, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, speed: "30 ft" },
    raw_source_ref: "",
};

export function useMonsterScaler() {
    const { catalog2014, catalog2024 } = useMergedCatalog();
    const [isScaling, startScaling] = useTransition();
    const [monster, setMonster] = useState<MonsterBase>(DEFAULT_MONSTER);
    const [edition, setEdition] = useState<Edition>("2014");
    const [targetCR, setTargetCR] = useState<number | null>(null);
    const [scaledMonster, setScaledMonster] = useState<MonsterBase | null>(null);
    const [acEquipment, setAcEquipment] = useState(0);
    const [acRace, setAcRace] = useState(0);
    const [abilityBonus, setAbilityBonus] = useState<ScaleOptions["abilityScoreBonus"]>({});
    const [catalogSearch, setCatalogSearch] = useState("");
    const [saved, setSaved] = useState(false);

    const allMonsters = useMemo(() => {
        const combined = [...catalog2014, ...catalog2024];
        const seen = new Set<string>();
        return combined.filter((m) => {
            const key = `${m.name}|${m.edition}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [catalog2014, catalog2024]);

    const handleLoadFromCatalog = (name: string) => {
        const match = allMonsters.find((m) => m.name === name);
        if (!match) return;
        const ed = (match.edition ?? "2014") as Edition;
        setEdition(ed);
        setMonster((prev) => ({
            ...prev,
            name: match.name,
            type: match.type ?? match.affiliation ?? prev.type,
            cr: match.cr,
            edition: ed,
            terrain: match.terrain,
            affiliation: match.affiliation,
            genus: match.genus,
            size: match.size ?? prev.size,
            stats: match.stats ?? prev.stats,
            actions: match.actions ?? prev.actions,
        }));
        setTargetCR(null);
        setScaledMonster(null);
        setCatalogSearch("");
        setSaved(false);
    };

    const handleStatChange = (stat: keyof MonsterBase["stats"], value: number | string) => {
        setMonster((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: value } }));
    };

    const handleAbilityBonusChange = (stat: keyof MonsterBase["stats"], value: number) => {
        setAbilityBonus((prev) => ({ ...prev, [stat]: value }));
    };

    const handleScale = () => {
        if (targetCR === null) return;
        startScaling(() => {
            const result = scaleMonster(
                { ...monster, edition },
                targetCR,
                edition,
                { acEquipment, acRace, abilityScoreBonus: abilityBonus },
            );
            setScaledMonster(result);
        });
    };

    const resetToForm = () => {
        setScaledMonster(null);
        setSaved(false);
    };

    return {
        monster, setMonster,
        edition, setEdition,
        targetCR, setTargetCR,
        scaledMonster,
        acEquipment, setAcEquipment,
        acRace, setAcRace,
        abilityBonus,
        catalogSearch, setCatalogSearch,
        saved, setSaved,
        allMonsters,
        isScaling,
        handleLoadFromCatalog,
        handleStatChange,
        handleAbilityBonusChange,
        handleScale,
        resetToForm,
    };
}
