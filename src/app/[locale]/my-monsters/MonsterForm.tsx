"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Monster, Terrain, Affiliation, Edition, MonsterSize } from "@/app/types/monster";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { Autocomplete } from "@/app/components/atoms/Autocomplete";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";
import { AbilityScoreGrid } from "@/app/components/molecules/AbilityScoreGrid";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import { useMonsterForm } from "@/app/hooks/useMonsterForm";
import { formatCR } from "@/app/lib/format";

const TERRAINS: Terrain[] = ["dungeon", "wilderness", "urban", "underwater", "planar", "any"];
const AFFILIATIONS: Affiliation[] = ["humanoid", "beast", "undead", "construct", "dragon", "fiend", "celestial", "fey", "monstrosity", "giant", "elemental", "aberration", "plant", "any"];
const SIZES: MonsterSize[] = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const CR_OPTIONS = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)];

type Props = {
    initial?: Monster;
    existingNames: Set<string>;
    onSave: (monster: Monster) => void;
    onCancel: () => void;
};

export default function MonsterForm({ initial, existingNames, onSave, onCancel }: Props) {
    const t = useTranslations("myMonsters");
    const { customMonsters } = useCustomMonsters();

    const knownGenera = useMemo(() => {
        const all = [...MONSTER_MANUAL_2014_CATALOG, ...MONSTER_MANUAL_2024_CATALOG, ...customMonsters];
        return [...new Set(all.map((m) => m.genus).filter(Boolean) as string[])].sort();
    }, [customMonsters]);

    const { state, dispatch, handleSubmit } = useMonsterForm(initial, existingNames, onSave, {
        nameRequired: t("form.nameRequired"),
        nameDuplicate: t("form.nameDuplicate"),
    });
    const {
        name, cr, edition, terrain, affiliation, genus,
        size, type, alignment, ac, hp, speed, abilityScores,
        dprMin, dprMax, dprRange, xp, actions, error,
    } = state;

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            {error && (
                <div className="p-3 rounded-sm text-sm border border-red-500/20 bg-red-500/5 text-red-400">
                    {error}
                </div>
            )}

            {/* ── Identity — mirrors top of a D&D stat block ── */}
            <Card className="p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
                <SectionHeader>
                    {initial ? t("editMonster") : t("addMonster")}
                </SectionHeader>

                <FormField label={t("form.name")}>
                    <Input
                        data-testid="homebrew-name"
                        value={name}
                        onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
                        className="text-2xl font-serif py-3"
                        placeholder={t("form.namePlaceholder")}
                    />
                </FormField>

                {/* Size / Type / Alignment — italic subtitle line */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t("form.size")}>
                        <Select value={size} onChange={(e) => dispatch({ type: "SET_SIZE", value: e.target.value as MonsterSize })}>
                            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </FormField>
                    <FormField label={t("form.type")}>
                        <Input value={type} onChange={(e) => dispatch({ type: "SET_TYPE", value: e.target.value })} placeholder={t("form.typePlaceholder")} />
                    </FormField>
                    <FormField label={t("form.alignment")}>
                        <Input value={alignment} onChange={(e) => dispatch({ type: "SET_ALIGNMENT", value: e.target.value })} placeholder={t("form.alignmentPlaceholder")} />
                    </FormField>
                </div>

                {/* Edition + CR — key identifiers */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t("form.edition")}>
                        <div className="flex gap-4 min-h-11 items-center">
                            {(["2014", "2024"] as Edition[]).map((ed) => (
                                <label key={ed} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edition" checked={edition === ed} onChange={() => dispatch({ type: "SET_EDITION", value: ed })} className="accent-gold" />
                                    <span className="text-sm">{ed}</span>
                                </label>
                            ))}
                        </div>
                    </FormField>
                    <FormField label={t("form.cr")}>
                        <Select value={cr} onChange={(e) => dispatch({ type: "SET_CR", value: Number(e.target.value) })}>
                            {CR_OPTIONS.map((c) => (
                                <option key={c} value={c}>{formatCR(c)}</option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label={t("form.xp")}>
                        <Input type="number" min={0} value={xp} onChange={(e) => dispatch({ type: "SET_XP", value: Number(e.target.value) })} />
                    </FormField>
                </div>
            </Card>

            {/* ── Defense — AC / HP / Speed block ── */}
            <Card className="p-6">
                <SectionHeader>
                    {t("form.statBlock")}
                </SectionHeader>

                <div className="grid gap-3 border-y border-gold/20 py-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-4">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm w-20 shrink-0">{t("form.ac")}</span>
                            <Input type="number" min={0} max={20} value={ac} onChange={(e) => dispatch({ type: "SET_AC", value: Number(e.target.value) })} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm w-20 shrink-0">{t("form.hp")}</span>
                            <Input type="number" min={0} value={hp} onChange={(e) => dispatch({ type: "SET_HP", value: Number(e.target.value) })} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm w-20 shrink-0">{t("form.speed")}</span>
                            <Input value={speed} onChange={(e) => dispatch({ type: "SET_SPEED", value: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <AbilityScoreGrid
                        values={abilityScores}
                        onChange={(key, value) => dispatch({ type: "SET_ABILITY_SCORE", key, value })}
                        labels={{ str: t("form.str"), dex: t("form.dex"), con: t("form.con"), int: t("form.int"), wis: t("form.wis"), cha: t("form.cha") }}
                    />
                </div>

                {/* DPR */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField label={t("form.dprMin")}>
                        <Input type="number" min={0} value={dprMin} onChange={(e) => dispatch({ type: "SET_DPR_MIN", value: Number(e.target.value) })} />
                    </FormField>
                    <FormField label={t("form.dprMax")}>
                        <Input type="number" min={0} value={dprMax} onChange={(e) => dispatch({ type: "SET_DPR_MAX", value: Number(e.target.value) })} />
                    </FormField>
                    <FormField label={t("form.dprRange")}>
                        <Input value={dprRange} onChange={(e) => dispatch({ type: "SET_DPR_RANGE", value: e.target.value })} placeholder={t("form.dprRangePlaceholder")} />
                    </FormField>
                </div>
            </Card>

            {/* ── Actions ── */}
            <Card className="p-6">
                <SectionHeader>
                    {t("form.actions")}
                </SectionHeader>
                <div className="space-y-2">
                    {actions.map((action, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <Input
                                value={action.name}
                                placeholder={t("form.actionName")}
                                onChange={(e) => dispatch({ type: "UPDATE_ACTION", index: i, patch: { name: e.target.value } })}
                            />
                            <Input
                                value={action.damage ?? ""}
                                placeholder={t("form.actionDamage")}
                                onChange={(e) => dispatch({ type: "UPDATE_ACTION", index: i, patch: { damage: e.target.value || undefined } })}
                            />
                            <button
                                type="button"
                                onClick={() => dispatch({ type: "REMOVE_ACTION", index: i })}
                                className="text-red-400/60 hover:text-red-400 px-2 text-lg shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => dispatch({ type: "ADD_ACTION" })}
                    className="ui-link text-xs uppercase tracking-widest mt-3"
                >
                    + {t("form.addAction")}
                </button>
            </Card>

            {/* ── Encounter Data — terrain, affiliation, genus ── */}
            <Card className="p-6">
                <SectionHeader>
                    {t("form.encounterData")}
                </SectionHeader>

                {/* Terrain */}
                <div className="mb-4">
                    <FormField label={t("form.terrain")}>
                        <Autocomplete
                            multiple
                            value={terrain}
                            onChange={(val) => dispatch({ type: "SET_TERRAIN", value: val as Terrain[] })}
                            options={TERRAINS}
                            placeholder={t("form.terrainPlaceholder")}
                        />
                    </FormField>
                </div>

                {/* Affiliation */}
                <div className="mb-4">
                    <FormField label={t("form.affiliation")}>
                        <Autocomplete
                            value={affiliation}
                            onChange={(val) => dispatch({ type: "SET_AFFILIATION", value: val as Affiliation })}
                            options={AFFILIATIONS}
                            placeholder={t("form.affiliationPlaceholder")}
                        />
                    </FormField>
                </div>

                {/* Genus */}
                <div>
                    <FormField label={t("form.genus")} sublabel={t("form.genusSublabel")}>
                        <Autocomplete
                            value={genus}
                            onChange={(val) => dispatch({ type: "SET_GENUS", value: val })}
                            options={knownGenera}
                            placeholder={t("form.genusPlaceholder")}
                        />
                    </FormField>
                </div>
            </Card>

            {/* ── Submit ── */}
            <div className="flex gap-3">
                <Button data-testid="save-monster-btn" type="submit" variant="primary" className="px-8 py-3 text-sm uppercase tracking-widest">{t("saveMonster")}</Button>
                <Button type="button" onClick={onCancel} className="px-8 py-3 text-xs uppercase tracking-widest">{t("cancel")}</Button>
            </div>
        </form>
    );
}
