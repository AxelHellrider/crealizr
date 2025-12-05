"use client";

import { useState, useRef } from "react";
import { scaleMonster2014 } from "@/app/utils/scaler";
import type { MonsterBase } from "@/app/types/monsters_schema";
import { ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";
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
        challenge_rating: 0,
        xp: 0,
        stats: { ac: 10, hp: 1, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, speed: "30 ft" },
        raw_source_ref: "",
    });
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
            setScaledMonster(
                scaleMonster2014(monster, targetCR, {
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

    const boxStyle: React.CSSProperties = { backgroundColor: "#222", padding: 12, borderRadius: 8, textAlign: "center", flex: "1 0 30%" };
    const inputStyle: React.CSSProperties = { display: "block", width: "100%", padding: 8, marginBottom: 12, borderRadius: 6, border: "1px solid #555", backgroundColor: "#222", color: "#fff" };

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 20, color: "#fff", fontFamily: "sans-serif" }}>
            {step === 1 && (
                <div style={{ backgroundColor: "#111", padding: 20, borderRadius: 12 }}>
                    <h1 style={{ fontSize: 24, marginBottom: 16, borderBottom: "1px solid #444", paddingBottom: 8 }}>
                        Enter Monster Details
                    </h1>

                    {/* --- Basic Info --- */}
                    <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#1a1a1a", borderRadius: 8 }}>
                        <h2 style={{ marginBottom: 8 }}>Basic Info</h2>
                        <label>Name</label>
                        <input style={inputStyle} value={monster.name} onChange={(e) => setMonster({ ...monster, name: e.target.value })} />
                        <label>Type</label>
                        <input style={inputStyle} value={monster.type} onChange={(e) => setMonster({ ...monster, type: e.target.value })} />
                        <label>Current CR</label>
                        <input type="number" style={inputStyle} value={monster.challenge_rating} onChange={(e) => setMonster({ ...monster, challenge_rating: Number(e.target.value) })} />
                        <label>Target CR</label>
                        <input type="number" style={inputStyle} value={targetCR ?? ""} onChange={(e) => setTargetCR(Number(e.target.value))} />
                    </div>

                    {/* --- Base Stats --- */}
                    <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#1a1a1a", borderRadius: 8 }}>
                        <h2 style={{ marginBottom: 8 }}>Base Stats</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            {Object.entries(monster.stats).map(([key, value]) => (
                                <div key={key} style={{ flex: "1 0 30%" }}>
                                    <label>{key.toUpperCase()}</label>
                                    <input
                                        style={inputStyle}
                                        type={key === "speed" ? "text" : "number"}
                                        value={value as string | number}
                                        onChange={(e) => handleStatChange(key as keyof MonsterBase["stats"], key === "speed" ? e.target.value : Number(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Additional Bonuses --- */}
                    <div style={{ marginBottom: 20, padding: 12, backgroundColor: "#1a1a1a", borderRadius: 8 }}>
                        <h2 style={{ marginBottom: 8 }}>Additional Bonuses</h2>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ flex: "1 0 45%" }}>
                                <label>AC from Equipment</label>
                                <input type="number" style={inputStyle} value={acEquipment} onChange={(e) => setAcEquipment(Number(e.target.value))} />
                            </div>
                            <div style={{ flex: "1 0 45%" }}>
                                <label>AC from Race</label>
                                <input type="number" style={inputStyle} value={acRace} onChange={(e) => setAcRace(Number(e.target.value))} />
                            </div>
                        </div>

                        <h3 style={{ marginTop: 12, marginBottom: 8 }}>Ability Score Bonuses</h3>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
                                <div key={ab} style={{ flex: "1 0 30%" }}>
                                    <label>{ab.toUpperCase()}</label>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={abilityBonus[ab as keyof MonsterBase["stats"]] ?? 0}
                                        onChange={(e) => handleAbilityBonusChange(ab as keyof MonsterBase["stats"], Number(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleScale}
                        style={{ padding: 10, backgroundColor: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
                    >
                        Generate Statblock
                    </button>
                </div>
            )}

            {step === 2 && scaledMonster && (
                <div ref={statBlockRef} style={{ backgroundColor: "#111", padding: 20, marginTop: 20, borderRadius: 12 }}>
                    <h1 style={{ fontSize: 24, marginBottom: 16, borderBottom: "1px solid #444", paddingBottom: 8 }}>Scaled Monster</h1>
                    <p><strong>Name:</strong> {scaledMonster.name}</p>
                    <p><strong>Type:</strong> {scaledMonster.type}</p>
                    <p><strong>CR:</strong> {scaledMonster.challenge_rating}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                        {Object.entries(scaledMonster.stats).map(([key, value]) =>
                            !["speed"].includes(key) ? (
                                <div key={key} style={boxStyle}>
                                    <strong>{key.toUpperCase()}</strong>
                                    <div>{value} {!["ac", "hp"].includes(key) ? `(${getModifier(Number(value))})` : null}</div>
                                </div>
                            ) : null
                        )}
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                        <button onClick={() => setStep(1)} style={{ padding: 8, backgroundColor: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Edit Monster</button>
                        <button onClick={downloadImage} style={{ padding: 8, backgroundColor: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Download Image</button>
                        <button onClick={downloadPDF} style={{ padding: 8, backgroundColor: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Download PDF</button>
                    </div>
                </div>
            )}
        </div>
    );
}
