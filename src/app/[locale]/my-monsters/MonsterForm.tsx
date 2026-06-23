"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Monster, Terrain, Affiliation, Edition, MonsterSize, MonsterAction } from "@/app/types/monster";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";

const TERRAINS: Terrain[] = ["dungeon", "wilderness", "urban", "underwater", "planar", "any"];
const AFFILIATIONS: Affiliation[] = ["humanoid", "beast", "undead", "construct", "dragon", "fiend", "celestial", "fey", "monstrosity", "giant", "elemental", "aberration", "plant", "any"];
const SIZES: MonsterSize[] = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const CR_OPTIONS = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)];

function formatCR(cr: number): string {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return String(cr);
}

type Props = {
    initial?: Monster;
    existingNames: Set<string>;
    onSave: (monster: Monster) => void;
    onCancel: () => void;
};

export default function MonsterForm({ initial, existingNames, onSave, onCancel }: Props) {
    const t = useTranslations("myMonsters");

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
    const [str, setStr] = useState(initial?.stats?.str ?? 10);
    const [dex, setDex] = useState(initial?.stats?.dex ?? 10);
    const [con, setCon] = useState(initial?.stats?.con ?? 10);
    const [int, setInt] = useState(initial?.stats?.int ?? 10);
    const [wis, setWis] = useState(initial?.stats?.wis ?? 10);
    const [cha, setCha] = useState(initial?.stats?.cha ?? 10);
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
            monster.stats = { ac, hp, speed, str, dex, con, int, wis, cha };
            monster.dpr = { min: dprMin, max: dprMax, range: dprRange };
            if (actions.length > 0) monster.actions = actions;
        }

        onSave(monster);
    }

    function toggleTerrain(t: Terrain) {
        setTerrain((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            <h2 className="text-2xl font-serif accent-gold uppercase tracking-wide">
                {initial ? t("editMonster") : t("addMonster")}
            </h2>

            {error && (
                <div className="p-3 rounded-sm text-sm border border-red-500/20 bg-red-500/5 text-red-400">
                    {error}
                </div>
            )}

            {/* ── Core fields ── */}
            <Card className="p-6 border-gold/10">
                <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold mb-4">Core</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t("form.name")}>
                        <Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
                    </FormField>
                    <FormField label={t("form.cr")}>
                        <Select value={cr} onChange={(e) => setCr(Number(e.target.value))}>
                            {CR_OPTIONS.map((c) => (
                                <option key={c} value={c}>{formatCR(c)}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>

                {/* Edition */}
                <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{t("form.edition")}</div>
                    <div className="flex gap-4">
                        {(["2014", "2024"] as Edition[]).map((ed) => (
                            <label key={ed} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="edition" checked={edition === ed} onChange={() => setEdition(ed)} className="accent-gold" />
                                <span className="text-sm">{ed}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Terrain */}
                <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{t("form.terrain")}</div>
                    <div className="flex flex-wrap gap-2">
                        {TERRAINS.map((ter) => (
                            <button
                                key={ter}
                                type="button"
                                onClick={() => toggleTerrain(ter)}
                                className={`px-3 py-1.5 text-xs uppercase tracking-widest border rounded-sm transition-colors ${
                                    terrain.includes(ter) ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted hover:bg-gold/5"
                                }`}
                            >
                                {ter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Affiliation + Genus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField label={t("form.affiliation")}>
                        <Select value={affiliation} onChange={(e) => setAffiliation(e.target.value as Affiliation)}>
                            {AFFILIATIONS.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label={t("form.genus")}>
                        <Input value={genus} onChange={(e) => setGenus(e.target.value)} />
                    </FormField>
                </div>
            </Card>

            {/* ── Stat block (collapsible) ── */}
            <Card className="p-6 border-gold/10">
                <button
                    type="button"
                    onClick={() => setShowStats(!showStats)}
                    className="w-full flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gold/70 font-bold hover:text-gold transition-colors"
                >
                    <span>{t("form.statBlock")}</span>
                    <span className="text-lg">{showStats ? "−" : "+"}</span>
                </button>

                {showStats && (
                    <div className="mt-6 grid gap-6">
                        {/* Identity */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField label={t("form.size")}>
                                <Select value={size} onChange={(e) => setSize(e.target.value as MonsterSize)}>
                                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </Select>
                            </FormField>
                            <FormField label={t("form.type")}>
                                <Input value={type} onChange={(e) => setType(e.target.value)} />
                            </FormField>
                            <FormField label={t("form.alignment")}>
                                <Input value={alignment} onChange={(e) => setAlignment(e.target.value)} />
                            </FormField>
                            <FormField label={t("form.xp")}>
                                <Input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} />
                            </FormField>
                        </div>

                        {/* Defense */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField label={t("form.ac")}>
                                <Input type="number" value={ac} onChange={(e) => setAc(Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("form.hp")}>
                                <Input type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("form.speed")} className="col-span-2">
                                <Input value={speed} onChange={(e) => setSpeed(e.target.value)} />
                            </FormField>
                        </div>

                        {/* Ability scores */}
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Ability Scores</div>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {[
                                    { key: "str", val: str, set: setStr },
                                    { key: "dex", val: dex, set: setDex },
                                    { key: "con", val: con, set: setCon },
                                    { key: "int", val: int, set: setInt },
                                    { key: "wis", val: wis, set: setWis },
                                    { key: "cha", val: cha, set: setCha },
                                ].map(({ key, val, set }) => (
                                    <FormField key={key} label={t(`form.${key}`)}>
                                        <Input type="number" value={val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(Number(e.target.value))} />
                                    </FormField>
                                ))}
                            </div>
                        </div>

                        {/* DPR */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField label={t("form.dprMin")}>
                                <Input type="number" value={dprMin} onChange={(e) => setDprMin(Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("form.dprMax")}>
                                <Input type="number" value={dprMax} onChange={(e) => setDprMax(Number(e.target.value))} />
                            </FormField>
                            <FormField label={t("form.dprRange")}>
                                <Input value={dprRange} onChange={(e) => setDprRange(e.target.value)} />
                            </FormField>
                        </div>

                        {/* Actions */}
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted mb-3">{t("form.actions")}</div>
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
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Submit ── */}
            <div className="flex gap-3">
                <Button type="submit" className="px-6 py-2.5 text-xs uppercase tracking-widest">{t("saveMonster")}</Button>
                <button type="button" onClick={onCancel} className="ui-button px-6 py-2.5 text-xs uppercase tracking-widest">
                    {t("cancel")}
                </button>
            </div>
        </form>
    );
}
