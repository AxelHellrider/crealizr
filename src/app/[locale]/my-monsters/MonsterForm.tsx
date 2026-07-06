"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Monster, Terrain, Affiliation, Edition, MonsterSize, MonsterAction } from "@/app/types/monster";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { Autocomplete } from "@/app/components/atoms/Autocomplete";
import { SectionHeader } from "@/app/components/atoms/SectionHeader";
import { AbilityScoreGrid, type AbilityScores } from "@/app/components/molecules/AbilityScoreGrid";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import { formatCR } from "@/app/lib/format";
import { clamp } from "@/app/lib/number";

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

    const [name, setName] = useState(initial?.name ?? "");
    const [cr, setCr] = useState(initial?.cr ?? 1);
    const [edition, setEdition] = useState<Edition>(initial?.edition ?? "2014");
    const [terrain, setTerrain] = useState<Terrain[]>(initial?.terrain ?? ["any"]);
    const [affiliation, setAffiliation] = useState<Affiliation>(initial?.affiliation ?? "humanoid");
    const [genus, setGenus] = useState(initial?.genus ?? "");

    const [showStats, setShowStats] = useState(!!initial?.stats);
    const [size, setSize] = useState<MonsterSize>(initial?.size ?? "Medium");
    const [type, setType] = useState(initial?.type ?? "");
    const [alignment, setAlignment] = useState(initial?.alignment ?? "");
    const [ac, setAc] = useState(initial?.stats?.ac ?? 10);
    const [hp, setHp] = useState(initial?.stats?.hp ?? 10);
    const [speed, setSpeed] = useState(initial?.stats?.speed ?? "30 ft");
    const [abilityScores, setAbilityScores] = useState<AbilityScores>({
        str: initial?.stats?.str ?? 10,
        dex: initial?.stats?.dex ?? 10,
        con: initial?.stats?.con ?? 10,
        int: initial?.stats?.int ?? 10,
        wis: initial?.stats?.wis ?? 10,
        cha: initial?.stats?.cha ?? 10,
    });
    const [dprMin, setDprMin] = useState(initial?.dpr?.min ?? 0);
    const [dprMax, setDprMax] = useState(initial?.dpr?.max ?? 0);
    const [dprRange, setDprRange] = useState(initial?.dpr?.range ?? "");
    const [xp, setXp] = useState(initial?.xp ?? 0);
    const [actions, setActions] = useState<MonsterAction[]>(initial?.actions ?? []);

    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError(t("form.nameRequired"));
            return;
        }
        if (!initial && existingNames.has(trimmed.toLowerCase())) {
            setError(t("form.nameDuplicate"));
            return;
        }
        if (initial && trimmed.toLowerCase() !== initial.name.toLowerCase() && existingNames.has(trimmed.toLowerCase())) {
            setError(t("form.nameDuplicate"));
            return;
        }

        const monster: Monster = {
            name: trimmed,
            cr,
            edition,
            terrain,
            affiliation,
            genus: genus || undefined,
            source: "homebrew",
        };

        if (showStats) {
            monster.size = size;
            monster.type = type || undefined;
            monster.alignment = alignment || undefined;
            monster.xp = xp;
            monster.stats = { ac, hp, speed, ...abilityScores };
            monster.dpr = { min: dprMin, max: dprMax, range: dprRange };
            if (actions.length > 0) monster.actions = actions;
        }

        onSave(monster);
    }

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
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        className="text-2xl font-serif py-3"
                        placeholder="e.g. Dire Owlbear"
                    />
                </FormField>

                {/* Size / Type / Alignment — italic subtitle line */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t("form.size")}>
                        <Select value={size} onChange={(e) => { setSize(e.target.value as MonsterSize); if (!showStats) setShowStats(true); }}>
                            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </FormField>
                    <FormField label={t("form.type")}>
                        <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. monstrosity" />
                    </FormField>
                    <FormField label={t("form.alignment")}>
                        <Input value={alignment} onChange={(e) => setAlignment(e.target.value)} placeholder="e.g. chaotic evil" />
                    </FormField>
                </div>

                {/* Edition + CR — key identifiers */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t("form.edition")}>
                        <div className="flex gap-4 min-h-11 items-center">
                            {(["2014", "2024"] as Edition[]).map((ed) => (
                                <label key={ed} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edition" checked={edition === ed} onChange={() => setEdition(ed)} className="accent-gold" />
                                    <span className="text-sm">{ed}</span>
                                </label>
                            ))}
                        </div>
                    </FormField>
                    <FormField label={t("form.cr")}>
                        <Select value={cr} onChange={(e) => setCr(Number(e.target.value))}>
                            {CR_OPTIONS.map((c) => (
                                <option key={c} value={c}>{formatCR(c)}</option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label={t("form.xp")}>
                        <Input type="number" min={0} value={xp} onChange={(e) => setXp(Math.max(0, Number(e.target.value)))} />
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
                            <Input type="number" min={0} max={20} value={ac} onChange={(e) => { setAc(clamp(Number(e.target.value), 0, 30)); if (!showStats) setShowStats(true); }} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm w-20 shrink-0">{t("form.hp")}</span>
                            <Input type="number" min={0} value={hp} onChange={(e) => { setHp(Math.max(0, Number(e.target.value))); if (!showStats) setShowStats(true); }} />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-serif uppercase tracking-widest text-gold/80 text-sm w-20 shrink-0">{t("form.speed")}</span>
                            <Input value={speed} onChange={(e) => { setSpeed(e.target.value); if (!showStats) setShowStats(true); }} />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <AbilityScoreGrid
                        values={abilityScores}
                        onChange={(key, value) => {
                            setAbilityScores((prev) => ({ ...prev, [key]: value }));
                            if (!showStats) setShowStats(true);
                        }}
                        labels={{ str: t("form.str"), dex: t("form.dex"), con: t("form.con"), int: t("form.int"), wis: t("form.wis"), cha: t("form.cha") }}
                    />
                </div>

                {/* DPR */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField label={t("form.dprMin")}>
                        <Input type="number" min={0} value={dprMin} onChange={(e) => setDprMin(Math.max(0, Number(e.target.value)))} />
                    </FormField>
                    <FormField label={t("form.dprMax")}>
                        <Input type="number" min={0} value={dprMax} onChange={(e) => setDprMax(Math.max(0, Number(e.target.value)))} />
                    </FormField>
                    <FormField label={t("form.dprRange")}>
                        <Input value={dprRange} onChange={(e) => setDprRange(e.target.value)} placeholder="e.g. 2d8+4" />
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
                                onChange={(e) => {
                                    const updated = [...actions];
                                    updated[i] = { ...updated[i], name: e.target.value };
                                    setActions(updated);
                                }}
                            />
                            <Input
                                value={action.damage ?? ""}
                                placeholder={t("form.actionDamage")}
                                onChange={(e) => {
                                    const updated = [...actions];
                                    updated[i] = { ...updated[i], damage: e.target.value || undefined };
                                    setActions(updated);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setActions(actions.filter((_, j) => j !== i))}
                                className="text-red-400/60 hover:text-red-400 px-2 text-lg shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => setActions([...actions, { name: "" }])}
                    className="ui-link text-xs uppercase tracking-widest mt-3"
                >
                    + {t("form.addAction")}
                </button>
            </Card>

            {/* ── Encounter Data — terrain, affiliation, genus ── */}
            <Card className="p-6">
                <SectionHeader>
                    Encounter Data
                </SectionHeader>

                {/* Terrain */}
                <div className="mb-4">
                    <FormField label={t("form.terrain")}>
                        <Autocomplete
                            multiple
                            value={terrain}
                            onChange={(val) => setTerrain(val as Terrain[])}
                            options={TERRAINS}
                            placeholder="Search terrains..."
                        />
                    </FormField>
                </div>

                {/* Affiliation */}
                <div className="mb-4">
                    <FormField label={t("form.affiliation")}>
                        <Autocomplete
                            value={affiliation}
                            onChange={(val) => setAffiliation(val as Affiliation)}
                            options={AFFILIATIONS}
                            placeholder="Search affiliations..."
                        />
                    </FormField>
                </div>

                {/* Genus */}
                <div>
                    <FormField label={t("form.genus")} sublabel="type or pick from existing">
                        <Autocomplete
                            value={genus}
                            onChange={setGenus}
                            options={knownGenera}
                            placeholder="e.g. owlbear, dragon, goblinoid"
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
