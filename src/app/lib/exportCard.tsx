"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { MonsterBase } from "@/app/types/monster";
import { formatCR } from "@/app/lib/format";
import { ABILITY_SCORE_MODIFIERS } from "@/app/data/constants";

// ── Design tokens (hardcoded so html2canvas never needs to resolve CSS vars) ──

const C = {
    bg:        "#12151c",
    surface:   "#1a1a23",
    gold:      "#c5a059",
    goldDim:   "rgba(197,160,89,0.35)",
    goldFaint: "rgba(197,160,89,0.07)",
    text:      "#e2e8f0",
    muted:     "#64748b",
    crimson:   "#dc2626",
    silver:    "#a8b2c1",
    blue:      "#3b82f6",
    purple:    "#8b5cf6",
};

const W = 480;

// ── Shared primitives ─────────────────────────────────────────────────────────

function Divider() {
    return <div style={{ height: 1, background: C.goldDim, margin: "0 0 20px" }} />;
}

function StatRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: `1px solid ${C.goldFaint}` }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: C.gold }}>{label}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: color ?? C.text }}>{value}</span>
        </div>
    );
}

// ── Monster export template ───────────────────────────────────────────────────

interface MonsterLabels {
    fallbackName?: string;
    armorClass?: string;
    hitPoints?: string;
    speed?: string;
    challengeRating?: string;
    suggestedDamagePerRound?: string;
}

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;

function abilityMod(score: number): string {
    for (const [mod, scores] of Object.entries(ABILITY_SCORE_MODIFIERS)) {
        if ((scores as number[]).includes(score)) return mod;
    }
    return "+0";
}

function MonsterExportTemplate({ monster, labels = {} }: { monster: MonsterBase; labels?: MonsterLabels }) {
    const l = {
        fallbackName: labels.fallbackName ?? "Scaled Monster",
        armorClass: labels.armorClass ?? "Armor Class",
        hitPoints: labels.hitPoints ?? "Hit Points",
        speed: labels.speed ?? "Speed",
        challengeRating: labels.challengeRating ?? "Challenge Rating",
        suggestedDamagePerRound: labels.suggestedDamagePerRound ?? "Suggested DPR",
    };

    return (
        <div style={{ width: W, background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif", boxSizing: "border-box", position: "relative" }}>
            {/* Gold accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: C.gold }} />

            <div style={{ padding: "36px 36px 36px 48px" }}>
                {/* Name */}
                <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, color: C.gold, textTransform: "uppercase", letterSpacing: -0.5, margin: "0 0 6px" }}>
                    {monster.name || l.fallbackName}
                </h1>
                {/* Meta */}
                <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.muted, fontSize: 13, margin: "0 0 20px" }}>
                    {[monster.size, monster.type, monster.alignment].filter(Boolean).join(" · ")}
                </p>

                <Divider />

                {/* Core stats */}
                <div style={{ marginBottom: 20 }}>
                    <StatRow label={l.armorClass} value={monster.stats.ac} />
                    <StatRow label={l.hitPoints} value={monster.stats.hp} />
                    <StatRow label={l.speed} value={monster.stats.speed} />
                </div>

                <Divider />

                {/* Ability scores – always 6-column at fixed width */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 20 }}>
                    {ABILITIES.map((key) => {
                        const val = Number((monster.stats as Record<string, unknown>)[key] ?? 10);
                        return (
                            <div key={key} style={{ textAlign: "center", padding: "8px 2px", border: `1px solid ${C.goldDim}`, background: C.goldFaint, borderRadius: 2 }}>
                                <div style={{ fontSize: 9, textTransform: "uppercase", color: C.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{key}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{val}</div>
                                <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>({abilityMod(val)})</div>
                            </div>
                        );
                    })}
                </div>

                <Divider />

                {/* CR / DPR */}
                <StatRow
                    label={l.challengeRating}
                    value={
                        <span>
                            {formatCR(monster.cr)}
                            <span style={{ fontSize: 11, color: C.muted, fontWeight: 400, marginLeft: 6 }}>({monster.edition})</span>
                        </span>
                    }
                />
                {monster.dpr && (
                    <StatRow label={l.suggestedDamagePerRound} value={monster.dpr.range} />
                )}
            </div>
        </div>
    );
}

// ── Item export template ──────────────────────────────────────────────────────

export interface ExportableItem {
    name: string;
    type: string;
    rarity: string;
    levelTuned: number;
    attunement: boolean;
    targetTags: string[];
    craftingCost?: number;
    craftingTime?: number;
    craftingTimeUnit?: string;
    craftingRequirement?: string;
    lore?: string;
    notes?: string;
    ingredients: { name: string; quantity: number; unit?: string }[];
    bonusToHit?: number;
    bonusAC?: number;
    bonusSaveDC?: number;
    avgDamageBonus?: number;
}

function ItemExportTemplate({ item }: { item: ExportableItem }) {
    const mechRows: Array<{ label: string; value: string; color?: string }> = [
        ...(item.bonusToHit    !== undefined ? [{ label: "To Hit Bonus",      value: `+${item.bonusToHit}`,    color: C.gold }]   : []),
        ...(item.bonusAC       !== undefined ? [{ label: "AC Bonus",           value: `+${item.bonusAC}`,       color: C.blue }]   : []),
        ...(item.bonusSaveDC   !== undefined ? [{ label: "Save DC",            value: `DC ${item.bonusSaveDC}`, color: C.purple }] : []),
        ...(item.avgDamageBonus !== undefined ? [{ label: "Avg Damage Bonus",  value: `+${item.avgDamageBonus}`, color: C.crimson }] : []),
    ];

    const ingredientStr = item.ingredients.length
        ? item.ingredients.map((i) => `${i.quantity}${i.unit ? ` ${i.unit}` : ""} ${i.name}`).join(", ")
        : "None";

    return (
        <div style={{ width: W, background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif", boxSizing: "border-box", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: C.gold }} />

            <div style={{ padding: "36px 36px 36px 48px" }}>
                {/* Name */}
                <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.gold, textTransform: "uppercase", letterSpacing: -0.5, margin: "0 0 6px" }}>
                    {item.name || "Unnamed Artifact"}
                </h1>
                <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.muted, fontSize: 13, margin: "0 0 4px" }}>
                    {item.rarity} · {item.type} · Level {item.levelTuned}
                </p>
                <p style={{ fontSize: 11, color: C.muted, margin: "0 0 20px" }}>
                    {item.attunement ? "Requires Attunement" : "No Attunement Required"}
                    {item.targetTags.length > 0 && ` · ${item.targetTags.join(", ")}`}
                </p>

                {mechRows.length > 0 && (
                    <>
                        <Divider />
                        <div style={{ marginBottom: 20 }}>
                            {mechRows.map(({ label, value, color }) => (
                                <StatRow key={label} label={label} value={value} color={color} />
                            ))}
                        </div>
                    </>
                )}

                <Divider />

                {/* Crafting */}
                <div style={{ marginBottom: 20 }}>
                    {item.craftingCost !== undefined && (
                        <StatRow label="Crafting Cost" value={`${item.craftingCost} gp`} />
                    )}
                    {item.craftingTime !== undefined && (
                        <StatRow label="Crafting Time" value={`${item.craftingTime} ${item.craftingTimeUnit ?? "days"}`} />
                    )}
                </div>

                {/* Ingredients */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.muted, fontWeight: 700, marginBottom: 6 }}>Ingredients</div>
                    <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.5 }}>{ingredientStr}</div>
                </div>

                {item.craftingRequirement && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.muted, fontWeight: 700, marginBottom: 6 }}>Crafting Requirement</div>
                        <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.5 }}>{item.craftingRequirement}</div>
                    </div>
                )}

                {item.lore && (
                    <div style={{ padding: "14px 18px", background: C.goldFaint, border: `1px solid ${C.goldDim}`, borderRadius: 2, marginBottom: 16 }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.muted, fontWeight: 700, marginBottom: 8 }}>Lore</div>
                        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                            &ldquo;{item.lore}&rdquo;
                        </div>
                    </div>
                )}

                {item.notes && (
                    <div style={{ padding: "12px 16px", background: C.goldFaint, border: `1px solid ${C.goldDim}`, borderRadius: 2, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                        &ldquo;{item.notes}&rdquo;
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Core: render template off-screen and capture ──────────────────────────────

async function captureTemplate(node: React.ReactElement): Promise<HTMLCanvasElement> {
    const host = document.createElement("div");
    // Positioned on-screen but off-viewport so html2canvas can paint it.
    // opacity:0 hides it visually; html2canvas still captures opacity:0 elements.
    Object.assign(host.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: `${W}px`,
        opacity: "0",
        pointerEvents: "none",
        zIndex: "99999",
    });
    document.body.appendChild(host);

    // flushSync renders the React tree synchronously into the host div.
    const root = createRoot(host);
    flushSync(() => { root.render(node); });

    const el = host.firstElementChild as HTMLElement;
    const canvas = await html2canvas(el, {
        scale: 2,
        width: W,
        height: el.scrollHeight,
        useCORS: true,
        backgroundColor: C.bg,
    } as Parameters<typeof html2canvas>[1]);

    root.unmount();
    document.body.removeChild(host);
    return canvas;
}

// ── Download helpers ──────────────────────────────────────────────────────────

function save(canvas: HTMLCanvasElement, filename: string, format: "png" | "pdf") {
    if (format === "png") {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${filename}.png`;
        a.click();
    } else {
        const data = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
        pdf.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function exportMonster(
    monster: MonsterBase,
    filename: string,
    format: "png" | "pdf",
    labels?: MonsterLabels
): Promise<void> {
    const canvas = await captureTemplate(<MonsterExportTemplate monster={monster} labels={labels} />);
    save(canvas, filename, format);
}

export async function exportItem(
    item: ExportableItem,
    filename: string,
    format: "png" | "pdf"
): Promise<void> {
    const canvas = await captureTemplate(<ItemExportTemplate item={item} />);
    save(canvas, filename, format);
}
