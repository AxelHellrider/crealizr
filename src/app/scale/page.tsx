"use client";

import { useState, useRef } from "react";
import { scaleMonster2014, scaleMonster2024 } from "@/app/utils/scaler";
import { MonsterBase } from "@/app/types/monsters_schema";
import { ABILITY_SCORE_MODIFIERS, CR_VALUES } from "@/app/data/constants";
import { formatCR } from "@/app/lib/format";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Input } from "@/app/components/atoms/Input";
import { Select } from "@/app/components/atoms/Select";
import { FormField } from "@/app/components/molecules/FormField";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";

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
    const [isScaling, setIsScaling] = useState(false);
    const statBlockRef = useRef<HTMLDivElement>(null);

    const handleStatChange = (stat: keyof MonsterBase["stats"], value: number | string) => {
        setMonster((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: value } }));
    };

    const handleAbilityBonusChange = (stat: keyof MonsterBase["stats"], value: number) => {
        setAbilityBonus((prev) => ({ ...prev, [stat]: value }));
    };

    /**
     * Handle scaling with a small timeout to prevent UI lag on rapid input.
     * Effectively a simple debounce for UX performance.
     */
    const handleScale = () => {
        setIsScaling(true);
        setTimeout(() => {
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
            setIsScaling(false);
        }, 100);
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
        <section className="glass-panel p-8 sm:p-12 fantasy-border">
            {step === 1 && (
                <div className="grid gap-8">
                    <header className="flex items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                        <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Monster Scaler</h1>
                        <a href="/scale/docs" className="ui-link text-sm italic">View Documentation</a>
                    </header>

                    {/* --- Basic Info --- */}
                    <Card className="p-6">
                        <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">General Information</h2>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField label="Name">
                                <Input value={monster.name} onChange={(e) => setMonster({ ...monster, name: e.target.value })} placeholder="e.g. Ancient Red Dragon" />
                            </FormField>
                            <FormField label="Creature Type">
                                <Input value={monster.type} onChange={(e) => setMonster({ ...monster, type: e.target.value })} placeholder="e.g. Dragon" />
                            </FormField>
                        </div>
                        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
                            <FormField label="Ruleset">
                                <Select value={edition} onChange={(e) => setEdition(e.target.value as "2014" | "2024")}>
                                    <option value="2014">2014 Ruleset</option>
                                    <option value="2024">2024 Ruleset</option>
                                </Select>
                            </FormField>
                            <FormField label="Current CR">
                                <Select value={monster.challenge_rating} onChange={(e) => setMonster({ ...monster, challenge_rating: Number(e.target.value) })}>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </FormField>
                            <FormField label="Target CR">
                                <Select value={targetCR ?? ""} onChange={(e) => setTargetCR(Number(e.target.value))}>
                                    <option value="" disabled>Select target CR</option>
                                    {CR_VALUES.filter((v) => v >= 0.125).map((cr) => (
                                        <option key={cr} value={cr}>{formatCR(cr)}</option>
                                    ))}
                                </Select>
                            </FormField>
                        </div>
                    </Card>

                    {/* --- Base Stats --- */}
                    <Card className="p-6">
                        <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">Base Attributes</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                            {Object.entries(monster.stats).map(([key, value]) => (
                                <FormField key={key} label={key}>
                                    <Input
                                        type={key === "speed" ? "text" : "number"}
                                        value={value as string | number}
                                        onChange={(e) => handleStatChange(key as keyof MonsterBase["stats"], key === "speed" ? e.target.value : Number(e.target.value))}
                                    />
                                </FormField>
                            ))}
                        </div>
                    </Card>

                    {/* --- Additional Bonuses --- */}
                    <Card className="p-6">
                        <h2 className="mb-6 font-serif text-xl accent-gold border-b border-gold/10 pb-3 uppercase tracking-wide">Defense & Ability Adjustments</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Equipment AC Bonus">
                                <Input type="number" value={acEquipment} onChange={(e) => setAcEquipment(Number(e.target.value))} />
                            </FormField>
                            <FormField label="Natural Armor Bonus">
                                <Input type="number" value={acRace} onChange={(e) => setAcRace(Number(e.target.value))} />
                            </FormField>
                        </div>

                        <h3 className="mt-8 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">Ability Score Bonuses</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
                                <FormField key={ab} label={ab}>
                                    <Input
                                        type="number"
                                        value={abilityBonus[ab as keyof MonsterBase["stats"]] ?? 0}
                                        onChange={(e) => handleAbilityBonusChange(ab as keyof MonsterBase["stats"], Number(e.target.value))}
                                    />
                                </FormField>
                            ))}
                        </div>
                    </Card>

                    <Button onClick={handleScale} variant="primary" disabled={isScaling} className="px-12 py-4 text-lg w-full sm:w-auto self-start">
                        {isScaling ? "SCALING..." : "SCALE MONSTER"}
                    </Button>
                </div>
            )}

            {step === 2 && scaledMonster && (
                <div className="grid gap-6">
                    <div ref={statBlockRef} className="neo-card p-10 fantasy-border shadow-2xl relative overflow-hidden bg-card">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
                        <h1 className="text-4xl font-serif pb-4 border-b border-gold/30 mb-6 accent-gold uppercase tracking-tighter">
                            {scaledMonster.name || "Scaled Monster"}
                        </h1>
                        <div className="grid gap-1 mb-6 italic text-muted font-serif">
                            <div>{scaledMonster.size} {scaledMonster.type}, {scaledMonster.alignment}</div>
                        </div>

                        <div className="grid gap-3 border-y border-gold/20 py-6 mb-8">
                            <div className="flex justify-between items-center"><span className="font-serif uppercase tracking-widest text-gold/80 text-sm">Armor Class</span> <span className="text-xl font-bold">{scaledMonster.stats.ac}</span></div>
                            <div className="flex justify-between items-center"><span className="font-serif uppercase tracking-widest text-gold/80 text-sm">Hit Points</span> <span className="text-xl font-bold">{scaledMonster.stats.hp}</span></div>
                            <div className="flex justify-between items-center"><span className="font-serif uppercase tracking-widest text-gold/80 text-sm">Speed</span> <span className="text-xl font-bold">{scaledMonster.stats.speed}</span></div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
                            {["str", "dex", "con", "int", "wis", "cha"].map((key) => (
                                <div key={key} className="text-center p-3 border border-gold/10 bg-gold/5 rounded-sm">
                                    <div className="text-[10px] uppercase text-gold font-bold tracking-widest mb-1">{key}</div>
                                    <div className="text-lg font-bold">{scaledMonster.stats[key as keyof MonsterBase["stats"]]}</div>
                                    <div className="text-xs text-muted italic">({getModifier(Number(scaledMonster.stats[key as keyof MonsterBase["stats"]]))})</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3">
                             <div className="flex justify-between items-baseline border-b border-gold/20 pb-2">
                                <span className="font-serif uppercase tracking-widest text-gold/80 text-sm">Challenge Rating</span>
                                <span className="text-lg font-bold">{formatCR(scaledMonster.challenge_rating)} <span className="text-muted text-xs ml-1 font-sans">({scaledMonster.edition} Ruleset)</span></span>
                            </div>
                            {scaledMonster.dpr && (
                                <div className="flex justify-between items-baseline border-b border-gold/20 pb-2">
                                    <span className="font-serif uppercase tracking-widest text-gold/80 text-sm">Suggested Damage Per Round</span>
                                    <span className="text-lg font-bold">{scaledMonster.dpr.range}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button onClick={() => setStep(1)} className="ui-button flex-1 border-gold/30 text-gold/80 font-serif tracking-widest uppercase text-xs">
                            ← ADJUST STATS
                        </button>
                        <button onClick={downloadImage} className="ui-button ui-button-primary flex-1">
                            DOWNLOAD IMAGE (PNG)
                        </button>
                        <button onClick={downloadPDF} className="ui-button ui-button-primary flex-1">
                            DOWNLOAD PDF
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
