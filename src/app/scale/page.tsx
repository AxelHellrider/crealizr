"use client";

import { useState, useRef } from "react";
import { scaleMonster2014, scaleMonster2024 } from "@/app/utils/scaler";
import type { MonsterBase } from "@/app/types/monsters_schema";
import { ABILITY_SCORE_MODIFIERS, CR_VALUES } from "@/app/data/constants";
import { formatCR } from "@/app/lib/format";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ScalePage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [monster, setMonster] = useState<MonsterBase>({
        name: "",
        edition: "2014",
        size: "Medium",
        type: "",
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
                        <h2 className="mb-2 font-medium">Basic Info</h2>
                        <label className="grid gap-1">
                            <span className="text-sm text-zinc-400">Name</span>
                            <input className="ui-input w-full" value={monster.name} onChange={(e) => setMonster({ ...monster, name: e.target.value })} />
                        </label>
                        <label className="mt-3 grid gap-1">
                            <span className="text-sm text-zinc-400">Type</span>
                            <input className="ui-input w-full" value={monster.type} onChange={(e) => setMonster({ ...monster, type: e.target.value })} />
                        </label>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Ruleset</span>
                                <select className="ui-select w-full" value={edition} onChange={(e) => setEdition(e.target.value as "2014" | "2024")}>
                                    <option value="2014">2014</option>
                                    <option value="2024">2024</option>
                                </select>
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Current CR</span>
                                <select className="ui-select w-full" value={monster.challenge_rating} onChange={(e) => setMonster({ ...monster, challenge_rating: Number(e.target.value) })}>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1">
                                <span className="text-sm text-zinc-400">Target CR</span>
                                <select className="ui-select w-full" value={targetCR ?? ""} onChange={(e) => setTargetCR(Number(e.target.value))}>
                                    <option value="" disabled>Select target CR</option>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* --- Base Stats --- */}
                    <div className="neo-card p-4">
                        <h2 className="mb-2 font-medium">Base Stats</h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(monster.stats).map(([key, value]) => (
                                <label key={key} className="grid gap-1 flex-[1_0_30%] min-w-[140px]">
                                    <span className="text-sm text-zinc-400">{key.toUpperCase()}</span>
                                    <input
                                        className="ui-input w-full"
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
                        <h2 className="mb-2 font-medium">Additional Bonuses</h2>

                        <div className="flex flex-wrap gap-3">
                            <label className="grid gap-1 flex-[1_0_45%] min-w-[200px]">
                                <span className="text-sm text-zinc-400">AC from Equipment</span>
                                <input type="number" className="ui-input w-full" value={acEquipment} onChange={(e) => setAcEquipment(Number(e.target.value))} />
                            </label>
                            <label className="grid gap-1 flex-[1_0_45%] min-w-[200px]">
                                <span className="text-sm text-zinc-400">AC from Race</span>
                                <input type="number" className="ui-input w-full" value={acRace} onChange={(e) => setAcRace(Number(e.target.value))} />
                            </label>
                        </div>

                        <h3 className="mt-3 mb-2 font-medium">Ability Score Bonuses</h3>
                        <div className="flex flex-wrap gap-3">
                            {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
                                <label key={ab} className="grid gap-1 flex-[1_0_30%] min-w-[140px]">
                                    <span className="text-sm text-zinc-400">{ab.toUpperCase()}</span>
                                    <input
                                        type="number"
                                        className="ui-input w-full"
                                        value={abilityBonus[ab as keyof MonsterBase["stats"]] ?? 0}
                                        onChange={(e) => handleAbilityBonusChange(ab as keyof MonsterBase["stats"], Number(e.target.value))}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleScale} className="ui-button">Generate Statblock</button>
                </div>
            )}

            {step === 2 && scaledMonster && (
                <div ref={statBlockRef} className="neo-card p-5 mt-5">
                    <h1 className="text-xl font-semibold pb-2 border-b border-zinc-700 mb-3">Scaled Monster</h1>
                    <p><strong>Name:</strong> {scaledMonster.name}</p>
                    <p><strong>Type:</strong> {scaledMonster.type}</p>
                    <p><strong>CR:</strong> {formatCR(scaledMonster.challenge_rating)} <span className="text-zinc-400">({scaledMonster.edition})</span></p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(scaledMonster.stats).map(([key, value]) =>
                            !["speed"].includes(key) ? (
                                <div key={key} className="neo-card p-3 text-center flex-[1_0_30%] min-w-[120px]">
                                    <strong>{key.toUpperCase()}</strong>
                                    <div>{value} {!["ac", "hp"].includes(key) ? `(${getModifier(Number(value))})` : null}</div>
                                </div>
                            ) : null
                        )}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={() => setStep(1)} className="ui-button">Edit Monster</button>
                        <button onClick={downloadImage} className="ui-button">Download Image</button>
                        <button onClick={downloadPDF} className="ui-button">Download PDF</button>
                    </div>
                </div>
            )}
        </section>
    );
}
