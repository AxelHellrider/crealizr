"use client";

import { useState, useRef } from "react";
import { scaleMonster2014, scaleMonster2024 } from "@/app/utils/scaler";
import { MonsterBase } from "@/app/types/monsters_schema";
import { ABILITY_SCORE_MODIFIERS, CR_VALUES } from "@/app/data/constants";
import { formatCR } from "@/app/lib/format";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";

export default function ScalePage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [monster, setMonster] = useState<MonsterBase>({
        name: "",
        edition: "2014",
        size: "Medium",
        type: "",
        dpr: {
            min: 1,
            max: 1,
            range: ""
        },
        alignment: "Unaligned",
        challenge_rating: 0.125,
        xp: 0,
        stats: { ac: 10, hp: 1, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, speed: "30 ft" },
        raw_source_ref: "",
    });
    const [edition, setEdition] = useState<"2014" | "2024">("2014");
    const [targetCR, setTargetCR] = useState<number | null>(null);
    const [scaledMonster, setScaledMonster] = useState<MonsterBase | null>(null);
    const [acEquipment, setAcEquipment] = useState<number>(0);
    const [acRace, setAcRace] = useState<number>(0);
    const [abilityBonus, setAbilityBonus] = useState<Partial<Record<keyof MonsterBase["stats"], number>>>({});
    const statBlockRef = useRef<HTMLDivElement>(null);

    const handleStatChange = (stat: keyof MonsterBase["stats"], value: number | string) => {
        setMonster((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: value } }));
    };

    const handleAbilityBonusChange = (stat: keyof MonsterBase["stats"], value: number) => {
        setAbilityBonus((prev) => ({ ...prev, [stat]: value }));
    };

    const handleScale = () => {
        if (targetCR !== null) {
            const base = { ...monster, edition };
            const fn = edition === "2024" ? scaleMonster2024 : scaleMonster2014;
            setScaledMonster(
                fn(base, targetCR, {
                    acEquipment,
                    acRace,
                    abilityScoreBonus: abilityBonus
                })
            );
            setStep(2);
        }
    };

    const downloadImage = async () => {
        if (!statBlockRef.current) return;
        const canvas = await html2canvas(statBlockRef.current, { scale: 2 });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${scaledMonster?.name || "monster"}.png`;
        link.click();
    };

    const downloadPDF = async () => {
        if (!statBlockRef.current) return;
        const canvas = await html2canvas(statBlockRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${scaledMonster?.name || "monster"}.pdf`);
    };

    const getModifier = (score: number) => {
        for (const [mod, scores] of Object.entries(ABILITY_SCORE_MODIFIERS)) {
            if (scores.includes(score)) return mod;
        }
        return "0";
    };

    return (
        <section className="glass-panel p-6">
            {step === 1 && (
                <div className="grid gap-4">
                    <header className="flex items-baseline justify-between gap-3">
                        <h1 className="text-2xl font-semibold">Enter Monster Details</h1>
                        <a href="/scale/docs" className="ui-link text-sm">How it works</a>
                    </header>

                    {/* --- Basic Info --- */}
                    <div className="neo-card p-4">
                        <h2 className="mb-3 font-medium border-b border-zinc-800 pb-2">Basic Info</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Name</span>
                                <Input value={monster.name} onChange={(e) => setMonster({ ...monster, name: e.target.value })} placeholder="e.g. Ancient Red Dragon" />
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Type</span>
                                <Input value={monster.type} onChange={(e) => setMonster({ ...monster, type: e.target.value })} placeholder="e.g. Dragon" />
                            </label>
                        </div>
                        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Ruleset</span>
                                <Select value={edition} onChange={(e) => setEdition(e.target.value as "2014" | "2024")}>
                                    <option value="2014">2014</option>
                                    <option value="2024">2024</option>
                                </Select>
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Current CR</span>
                                <Select value={monster.challenge_rating} onChange={(e) => setMonster({ ...monster, challenge_rating: Number(e.target.value) })}>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Target CR</span>
                                <Select value={targetCR ?? ""} onChange={(e) => setTargetCR(Number(e.target.value))}>
                                    <option value="" disabled>Select target CR</option>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </label>
                        </div>
                    </div>

                    {/* --- Base Stats --- */}
                    <div className="neo-card p-4">
                        <h2 className="mb-3 font-medium border-b border-zinc-800 pb-2">Base Stats</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                            {Object.entries(monster.stats).map(([key, value]) => (
                                <label key={key} className="grid gap-1">
                                    <span className="text-sm text-zinc-400">{key.toUpperCase()}</span>
                                    <Input
                                        type={key === "speed" ? "text" : "number"}
                                        value={value as string | number}
                                        onChange={(e) => handleStatChange(key as keyof MonsterBase["stats"], key === "speed" ? e.target.value : Number(e.target.value))}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* --- Additional Bonuses --- */}
                    <div className="neo-card p-4">
                        <h2 className="mb-3 font-medium border-b border-zinc-800 pb-2">Additional Bonuses</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">AC from Equipment</span>
                                <Input type="number" value={acEquipment} onChange={(e) => setAcEquipment(Number(e.target.value))} />
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">AC from Race</span>
                                <Input type="number" value={acRace} onChange={(e) => setAcRace(Number(e.target.value))} />
                            </label>
                        </div>

                        <h3 className="mt-4 mb-3 text-sm font-medium text-zinc-300">Ability Score Bonuses</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
                                <label key={ab} className="grid gap-1">
                                    <span className="text-sm text-zinc-400">{ab.toUpperCase()}</span>
                                    <Input
                                        type="number"
                                        value={abilityBonus[ab as keyof MonsterBase["stats"]] ?? 0}
                                        onChange={(e) => handleAbilityBonusChange(ab as keyof MonsterBase["stats"], Number(e.target.value))}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handleScale} className="w-full sm:w-auto self-start px-8">Generate Statblock</Button>
                </div>
            )}

            {step === 2 && scaledMonster && (
                <div className="grid gap-6">
                    <div ref={statBlockRef} className="neo-card p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
                        <h1 className="text-2xl font-bold pb-2 border-b border-zinc-700 mb-4 text-orange-400 uppercase tracking-wide">
                            {scaledMonster.name || "Scaled Monster"}
                        </h1>
                        <div className="grid gap-1 mb-4 italic text-zinc-400">
                            <div>{scaledMonster.size} {scaledMonster.type}, {scaledMonster.alignment}</div>
                        </div>

                        <div className="grid gap-2 border-y border-zinc-800 py-3 mb-4">
                            <div className="flex justify-between"><span className="font-bold text-zinc-300">Armor Class</span> <span>{scaledMonster.stats.ac}</span></div>
                            <div className="flex justify-between"><span className="font-bold text-zinc-300">Hit Points</span> <span>{scaledMonster.stats.hp}</span></div>
                            <div className="flex justify-between"><span className="font-bold text-zinc-300">Speed</span> <span>{scaledMonster.stats.speed}</span></div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                            {["str", "dex", "con", "int", "wis", "cha"].map((key) => (
                                <div key={key} className="text-center p-2 rounded bg-zinc-900/50 border border-white/5">
                                    <div className="text-[10px] uppercase text-zinc-500 font-bold">{key}</div>
                                    <div className="font-bold">{scaledMonster.stats[key as keyof MonsterBase["stats"]]}</div>
                                    <div className="text-xs text-zinc-400">({getModifier(Number(scaledMonster.stats[key as keyof MonsterBase["stats"]]))})</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-2">
                             <div className="flex justify-between items-baseline border-b border-zinc-800 pb-1">
                                <span className="font-bold text-zinc-300">Challenge</span>
                                <span>{formatCR(scaledMonster.challenge_rating)} <span className="text-zinc-500 text-xs ml-1">({scaledMonster.edition})</span></span>
                            </div>
                            {scaledMonster.dpr && (
                                <div className="flex justify-between items-baseline border-b border-zinc-800 pb-1">
                                    <span className="font-bold text-zinc-300">Suggested DPR</span>
                                    <span>{scaledMonster.dpr.range}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={() => setStep(1)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600">
                            ← Edit Monster
                        </Button>
                        <Button onClick={downloadImage} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-teal-900/20">
                            Download Image
                        </Button>
                        <Button onClick={downloadPDF} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-purple-900/20">
                            Download PDF
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
