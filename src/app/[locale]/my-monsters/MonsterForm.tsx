"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Monster, Terrain, Affiliation, Edition, MonsterSize, MonsterAction } from "@/app/types/monster";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { Card } from "@/app/components/atoms/Card";
import { FormField } from "@/app/components/molecules/FormField";
import { MONSTER_MANUAL_2014_CATALOG, MONSTER_MANUAL_2024_CATALOG } from "@/app/data/monsters";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";

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

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

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
            {error && (
                <div className="p-3 rounded-sm text-sm border border-red-500/20 bg-red-500/5 text-red-400">
                    {error}
                </div>
            )}

            {/* ── Identity — mirrors top of a D&D stat block ── */}
            <Card className="p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
                <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">
                    {initial ? t("editMonster") : t("addMonster")}
                </h2>

                {/* Name — large, like the stat block title */}
                <FormField label={t("form.name")}>
                    <input
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        className="ui-input w-full text-2xl font-serif py-3 transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
                            bg-bg-elev border-silver/30 text-foreground"
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
                <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">
                    {t("form.statBlock")}
                </h2>

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

                {/* Ability Scores — 6 boxes like the stat block display */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {[
                        { key: "str", val: str, set: setStr },
                        { key: "dex", val: dex, set: setDex },
                        { key: "con", val: con, set: setCon },
                        { key: "int", val: int, set: setInt },
                        { key: "wis", val: wis, set: setWis },
                        { key: "cha", val: cha, set: setCha },
                    ].map(({ key, val, set }) => (
                        <div key={key} className="text-center p-3 border border-gold/10 bg-gold/5 rounded-sm">
                            <div className="text-[10px] uppercase text-gold font-bold tracking-widest mb-2">{t(`form.${key}`)}</div>
                            <input
                                type="number"
                                value={val}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { set(clamp(Number(e.target.value), 0, 30)); if (!showStats) setShowStats(true); }}
                                className="w-full text-center text-lg font-bold bg-transparent border-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <div className="text-xs text-muted italic">({val >= 10 ? "+" : ""}{Math.floor((val - 10) / 2)})</div>
                        </div>
                    ))}
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
                <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">
                    {t("form.actions")}
                </h2>
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
                <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">
                    Encounter Data
                </h2>

                {/* Terrain */}
                <div className="mb-4">
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

                {/* Affiliation */}
                <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{t("form.affiliation")}</div>
                    <div className="flex flex-wrap gap-2">
                        {AFFILIATIONS.map((a) => (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setAffiliation(a)}
                                className={`px-3 py-1.5 text-xs uppercase tracking-widest border rounded-sm transition-colors ${
                                    affiliation === a ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted hover:bg-gold/5"
                                }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Genus */}
                <div>
                    <FormField label={t("form.genus")} sublabel="type or pick from existing">
                        <Input
                            value={genus}
                            onChange={(e) => setGenus(e.target.value)}
                            list="genus-options"
                            placeholder="e.g. owlbear, dragon, goblinoid"
                        />
                    </FormField>
                    <datalist id="genus-options">
                        {knownGenera.map((g) => <option key={g} value={g} />)}
                    </datalist>
                    {knownGenera.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {knownGenera.map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGenus(g)}
                                    className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border rounded-sm transition-colors ${
                                        genus === g ? "border-gold bg-gold/10 text-gold" : "border-gold/10 text-muted/60 hover:bg-gold/5 hover:text-muted"
                                    }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* ── Submit ── */}
            <div className="flex gap-3">
                <Button type="submit" variant="primary" className="px-8 py-3 text-sm uppercase tracking-widest">{t("saveMonster")}</Button>
                <button type="button" onClick={onCancel} className="ui-button px-8 py-3 text-xs uppercase tracking-widest">
                    {t("cancel")}
                </button>
            </div>
        </form>
    );
}
