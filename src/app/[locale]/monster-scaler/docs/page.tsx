"use client";

import {useState} from "react";

// ---------------------------------------------------------------------------------------
// FULL CR MATRICES (2014 & 2024) — All values included, 0 to 30
// ---------------------------------------------------------------------------------------

const CR_MATRIX_2014_FULL = [
    {cr: 0, pb: 2, ac: 12, hp: 1, atkb: 1, dpr: 1, save_dc: 10},
    {cr: 1 / 8, pb: 2, ac: 12, hp: 7, atkb: 3, dpr: 3, save_dc: 10},
    {cr: 1 / 4, pb: 2, ac: 13, hp: 15, atkb: 3, dpr: 5, save_dc: 11},
    {cr: 1 / 2, pb: 2, ac: 13, hp: 30, atkb: 4, dpr: 9, save_dc: 12},
    {cr: 1, pb: 2, ac: 13, hp: 30, atkb: 4, dpr: 9, save_dc: 12},
    {cr: 2, pb: 2, ac: 13, hp: 45, atkb: 4, dpr: 15, save_dc: 13},
    {cr: 3, pb: 2, ac: 13, hp: 60, atkb: 5, dpr: 21, save_dc: 13},
    {cr: 4, pb: 2, ac: 14, hp: 75, atkb: 5, dpr: 27, save_dc: 14},
    {cr: 5, pb: 3, ac: 15, hp: 130, atkb: 6, dpr: 33, save_dc: 15},
    {cr: 6, pb: 3, ac: 15, hp: 145, atkb: 6, dpr: 39, save_dc: 15},
    {cr: 7, pb: 3, ac: 15, hp: 160, atkb: 6, dpr: 45, save_dc: 15},
    {cr: 8, pb: 3, ac: 16, hp: 180, atkb: 7, dpr: 51, save_dc: 16},
    {cr: 9, pb: 4, ac: 16, hp: 200, atkb: 7, dpr: 57, save_dc: 16},
    {cr: 10, pb: 4, ac: 17, hp: 220, atkb: 7, dpr: 63, save_dc: 16},
    {cr: 11, pb: 4, ac: 17, hp: 245, atkb: 8, dpr: 69, save_dc: 17},
    {cr: 12, pb: 4, ac: 17, hp: 260, atkb: 8, dpr: 75, save_dc: 17},
    {cr: 13, pb: 5, ac: 18, hp: 280, atkb: 8, dpr: 81, save_dc: 18},
    {cr: 14, pb: 5, ac: 18, hp: 300, atkb: 9, dpr: 87, save_dc: 18},
    {cr: 15, pb: 5, ac: 18, hp: 325, atkb: 9, dpr: 93, save_dc: 18},
    {cr: 16, pb: 5, ac: 18, hp: 350, atkb: 10, dpr: 99, save_dc: 18},
    {cr: 17, pb: 6, ac: 19, hp: 400, atkb: 10, dpr: 105, save_dc: 19},
    {cr: 18, pb: 6, ac: 19, hp: 450, atkb: 10, dpr: 111, save_dc: 19},
    {cr: 19, pb: 6, ac: 19, hp: 500, atkb: 11, dpr: 117, save_dc: 19},
    {cr: 20, pb: 6, ac: 19, hp: 550, atkb: 11, dpr: 123, save_dc: 19},
    {cr: 21, pb: 7, ac: 19, hp: 600, atkb: 12, dpr: 129, save_dc: 20},
    {cr: 22, pb: 7, ac: 19, hp: 650, atkb: 12, dpr: 135, save_dc: 20},
    {cr: 23, pb: 7, ac: 19, hp: 700, atkb: 13, dpr: 141, save_dc: 20},
    {cr: 24, pb: 7, ac: 19, hp: 750, atkb: 13, dpr: 147, save_dc: 21},
    {cr: 25, pb: 8, ac: 19, hp: 800, atkb: 14, dpr: 153, save_dc: 21},
    {cr: 26, pb: 8, ac: 19, hp: 850, atkb: 14, dpr: 159, save_dc: 21},
    {cr: 27, pb: 8, ac: 19, hp: 900, atkb: 15, dpr: 165, save_dc: 22},
    {cr: 28, pb: 8, ac: 20, hp: 950, atkb: 15, dpr: 171, save_dc: 22},
    {cr: 29, pb: 9, ac: 20, hp: 1000, atkb: 16, dpr: 177, save_dc: 22},
    {cr: 30, pb: 9, ac: 21, hp: 1100, atkb: 17, dpr: 183, save_dc: 23},
];

const CR_MATRIX_2024_FULL = [
    {cr: 0, pb: 2, ac: 13, hp: 6, atkb: 2, dpr: 2, save_dc: 11},
    {cr: 1 / 8, pb: 2, ac: 13, hp: 10, atkb: 3, dpr: 4, save_dc: 11},
    {cr: 1 / 4, pb: 2, ac: 14, hp: 20, atkb: 4, dpr: 6, save_dc: 12},
    {cr: 1 / 2, pb: 2, ac: 14, hp: 35, atkb: 4, dpr: 10, save_dc: 12},
    {cr: 1, pb: 2, ac: 14, hp: 40, atkb: 5, dpr: 10, save_dc: 13},
    {cr: 2, pb: 2, ac: 15, hp: 55, atkb: 5, dpr: 18, save_dc: 13},
    {cr: 3, pb: 2, ac: 15, hp: 75, atkb: 6, dpr: 26, save_dc: 13},
    {cr: 4, pb: 2, ac: 15, hp: 85, atkb: 6, dpr: 32, save_dc: 14},
    {cr: 5, pb: 3, ac: 16, hp: 150, atkb: 7, dpr: 36, save_dc: 16},
    {cr: 6, pb: 3, ac: 16, hp: 165, atkb: 7, dpr: 42, save_dc: 16},
    {cr: 7, pb: 3, ac: 16, hp: 180, atkb: 7, dpr: 48, save_dc: 16},
    {cr: 8, pb: 3, ac: 17, hp: 190, atkb: 8, dpr: 54, save_dc: 17},
    {cr: 9, pb: 4, ac: 17, hp: 210, atkb: 8, dpr: 60, save_dc: 17},
    {cr: 10, pb: 4, ac: 18, hp: 240, atkb: 8, dpr: 66, save_dc: 18},
    {cr: 11, pb: 4, ac: 18, hp: 270, atkb: 9, dpr: 72, save_dc: 18},
    {cr: 12, pb: 4, ac: 18, hp: 300, atkb: 9, dpr: 78, save_dc: 18},
    {cr: 13, pb: 5, ac: 18, hp: 330, atkb: 10, dpr: 84, save_dc: 19},
    {cr: 14, pb: 5, ac: 19, hp: 350, atkb: 10, dpr: 90, save_dc: 19},
    {cr: 15, pb: 5, ac: 19, hp: 380, atkb: 11, dpr: 96, save_dc: 19},
    {cr: 16, pb: 5, ac: 19, hp: 420, atkb: 11, dpr: 102, save_dc: 20},
    {cr: 17, pb: 6, ac: 20, hp: 470, atkb: 12, dpr: 108, save_dc: 20},
    {cr: 18, pb: 6, ac: 20, hp: 520, atkb: 12, dpr: 114, save_dc: 20},
    {cr: 19, pb: 6, ac: 20, hp: 570, atkb: 13, dpr: 120, save_dc: 21},
    {cr: 20, pb: 6, ac: 20, hp: 620, atkb: 13, dpr: 126, save_dc: 21},
    {cr: 21, pb: 7, ac: 20, hp: 670, atkb: 14, dpr: 132, save_dc: 21},
    {cr: 22, pb: 7, ac: 20, hp: 720, atkb: 14, dpr: 138, save_dc: 22},
    {cr: 23, pb: 7, ac: 20, hp: 770, atkb: 15, dpr: 144, save_dc: 22},
    {cr: 24, pb: 7, ac: 21, hp: 820, atkb: 15, dpr: 150, save_dc: 22},
    {cr: 25, pb: 8, ac: 21, hp: 880, atkb: 16, dpr: 156, save_dc: 23},
    {cr: 26, pb: 8, ac: 21, hp: 940, atkb: 16, dpr: 162, save_dc: 23},
    {cr: 27, pb: 8, ac: 21, hp: 1000, atkb: 17, dpr: 168, save_dc: 23},
    {cr: 28, pb: 8, ac: 22, hp: 1060, atkb: 17, dpr: 174, save_dc: 24},
    {cr: 29, pb: 9, ac: 22, hp: 1120, atkb: 18, dpr: 180, save_dc: 24},
    {cr: 30, pb: 9, ac: 23, hp: 1200, atkb: 19, dpr: 186, save_dc: 24},
];

// ---------------------------------------------------------------------------------------
// Helper for nicely formatting CR values (0.125 ⇒ "1/8")
// ---------------------------------------------------------------------------------------
function formatCR(value: number) {
    if (value === 1 / 8) return "1/8";
    if (value === 1 / 4) return "1/4";
    if (value === 1 / 2) return "1/2";
    return value.toString();
}

// ---------------------------------------------------------------------------------------
// Reusable CR table renderer
// ---------------------------------------------------------------------------------------
function CRTable({data}: { data: typeof CR_MATRIX_2014_FULL }) {
    return (
        <div className="overflow-x-auto rounded bg-black/30 p-4 text-sm">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-black/50">
                <tr>
                    <th className="px-2 py-1">Challenge Rating</th>
                    <th className="px-2 py-1">Proficiency Bonus</th>
                    <th className="px-2 py-1">Armor Class</th>
                    <th className="px-2 py-1">Hit Points</th>
                    <th className="px-2 py-1">Attack Bonus</th>
                    <th className="px-2 py-1">Damage per Round</th>
                    <th className="px-2 py-1">Save DC</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row, i) => (
                    <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white/20" : "bg-white/10"}
                    >
                        <td className="px-2 py-1 text-center">{formatCR(row.cr)}</td>
                        <td className="px-2 py-1 text-center">{row.pb}</td>
                        <td className="px-2 py-1 text-center">{row.ac}</td>
                        <td className="px-2 py-1 text-center">{row.hp}</td>
                        <td className="px-2 py-1 text-center">+{row.atkb}</td>
                        <td className="px-2 py-1 text-center">{row.dpr}</td>
                        <td className="px-2 py-1 text-center">{row.save_dc}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------------------------------------------------------------------------------------
// Small inline code component
// ---------------------------------------------------------------------------------------
function Code({children}: { children: React.ReactNode }) {
    return (
        <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">
            {children}
        </code>
    );
}

export default function ScaleDocsPage() {
    const [edition, setEdition] = useState<"2014" | "2024">("2014");

    return (
        <section className="prose prose-invert max-w-3xl px-4 py-8">
            <h1 className="mb-2 text-3xl font-semibold">Monster Scaler – How it works</h1>
            <p className="text-zinc-400">This page documents the exact steps and formulas used by the Monster Scaler.
                Toggle 2014 or 2024 to swap the matrix data while keeping the same workflow.</p>

            <h2 className="mt-8 text-xl font-semibold">Inputs</h2>
            <ul>
                <li>Source monster stat block: name, size/type, current <Code>challenge_rating</Code>,
                    and <Code>stats</Code> (AC, HP, STR/DEX/CON/INT/WIS/CHA).
                </li>
                <li>Optional action list used to estimate DPR from damage expressions (e.g., <Code>1d6+2</Code>).</li>
                <li>Target CR (supports fractional CRs 1/8, 1/4, 1/2 and CR 1–30).</li>
                <li>Optional bonuses: <Code>acEquipment</Code>, <Code>acRace</Code>, and
                    per-ability <Code>abilityScoreBonus</Code>.
                </li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">CR row lookup</h2>
            <p>We look up two rows from the internal 2014 CR matrix: one for the source CR and one for the target CR.
                Each row contains reference values like proficiency bonus, expected AC, HP, attack bonus, DPR, and save
                DC.</p>
            <p>Implementation: <Code>findCRRow(cr)</Code> picks the highest row with <Code>row.cr ≤ cr</Code>.</p>

            <h2 className="mt-8 text-xl font-semibold">Damage per round (DPR) estimation</h2>
            <p>If the monster has actions with damage strings, we estimate average damage for each action and sum:</p>
            <ul>
                <li>For each token like <Code>X d Y</Code> (e.g., <Code>2d6</Code>), expected value = <Code>X × (Y + 1)
                    / 2</Code>.
                </li>
                <li>An optional flat modifier <Code>±N</Code> is added once to that action’s total.</li>
                <li>Non-dice numbers are parsed as a flat value where possible.</li>
            </ul>
            <p>The per-action averages are summed and rounded to nearest integer. If no actions are provided, we
                use <Code>1</Code>.</p>

            <h2 className="mt-8 text-xl font-semibold">HP scaling</h2>
            <p>HP is scaled proportionally from the source monster’s HP to the target row’s expected HP:</p>
            <p><Code>hpScale = tgtRow.hp / max(1, srcHP)</Code></p>
            <p><Code>finalHP = round(srcHP × hpScale)</Code>, with a minimum of 1.</p>

            <h2 className="mt-8 text-xl font-semibold">AC scaling</h2>
            <ul>
                <li>Compute raw delta: <Code>Δ = tgtRow.ac − srcAC</Code>.</li>
                <li>Apply at most ±2 points toward the target: <Code>finalAC_raw = clamp(srcAC + sign(Δ) × min(2, |Δ|),
                    5, 30)</Code>.
                </li>
                <li>Then apply user-supplied bonuses: <Code>finalAC = finalAC_raw + acEquipment + acRace</Code> (each
                    optional).
                </li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Ability score scaling (STR/DEX/CON/INT/WIS/CHA)</h2>
            <p>We scale ability scores by modifier steps, not by raw points:</p>
            <ol>
                <li>Compute CR difference: <Code>crDiff = targetCR − sourceCR</Code>.</li>
                <li>Increase the ability modifier by <Code>floor(crDiff / 2)</Code> steps. Example: from CR 1 to CR
                    5, <Code>crDiff=4</Code> ⇒ <Code>+2</Code> modifier steps.
                </li>
                <li>Map the new modifier back to the nearest canonical score using the standard “score ⇒ modifier”
                    table.
                </li>
                <li>Apply any per-ability bonus (<Code>abilityScoreBonus</Code>), then clamp to the 1–30 range.</li>
            </ol>
            <p>HP and AC are explicitly excluded from this loop since they are handled by the formulas above.</p>

            <h2 className="mt-8 text-xl font-semibold">Attack bonus advice</h2>
            <p>We provide a suggested attack bonus to help you tune actions:</p>
            <ul>
                <li>Determine the best attack ability modifier: <Code>atkAbilityMod = max(mod(STR), mod(DEX))</Code> for
                    the scaled stats.
                </li>
                <li>Compute how the matrix’s baseline attack bonus changes: <Code>attackDelta = tgtRow.atkb −
                    srcRow.atkb</Code>.
                </li>
                <li>Adjust for the change in the monster’s own attack stat mod (scaled vs. source): <Code>atkAbilityMod
                    − srcAtkMod</Code>.
                </li>
                <li>Suggested: <Code>finalAttackBonus = round(srcRow.atkb + attackDelta + atkAbilityMod −
                    srcAtkMod)</Code>.
                </li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Save DC advice</h2>
            <p>Suggested save DC starts from the target row’s DC and shifts with the monster’s INT modifier change (as a
                simple spellcasting‑style proxy):</p>
            <p><Code>finalSaveDC = tgtRow.save_dc + (mod(INT_scaled) − mod(INT_source))</Code></p>

            <h2 className="mt-8 text-xl font-semibold">DPR reference scale</h2>
            <p>We also report scaling factors to help you retune damage:</p>
            <ul>
                <li><Code>srcDPR</Code>: estimated from the input actions.</li>
                <li><Code>tgtDPR</Code>: matrix value for target CR.</li>
                <li><Code>dprScale = tgtDPR / max(1, srcDPR)</Code></li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Bounds and clamps</h2>
            <ul>
                <li>AC is clamped to 5–30 after all adjustments.</li>
                <li>Ability scores are clamped to 1–30.</li>
                <li>HP has a minimum of 1.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Fractional CRs and ranges</h2>
            <p>The scaler supports CR 1/8, 1/4, 1/2 and 1–30. Internally, target/source rows are selected by ≤ logic, so
                a non‑listed CR value will use the nearest lower row.</p>

            <h2 className="mt-8 text-xl font-semibold">Randomness note</h2>
            <p>The in‑app 2014 CR matrix spans the DMG ranges and includes some randomized values for AC/HP/DPR within
                official bands to avoid singular results. The production app uses the real matrix; you can always
                override outcomes via the bonuses described above.</p>

            <h2 className="mt-12 text-xl font-semibold">CR Matrix Reference</h2>
            <p className="text-zinc-400">
                These are the complete baseline stat expectations used for scaling.
            </p>

            {/* Tab switcher */}
            <div className="flex gap-4 mt-4">
                <button
                    className={`px-4 py-1 rounded ${
                        edition === "2014" ? "bg-amber-500 text-black" : "bg-black/40"
                    }`}
                    onClick={() => setEdition("2014")}
                >
                    2014 Edition
                </button>
                <button
                    className={`px-4 py-1 rounded ${
                        edition === "2024" ? "bg-amber-500 text-black" : "bg-black/40"
                    }`}
                    onClick={() => setEdition("2024")}
                >
                    2024 Edition
                </button>
            </div>

            <div className="mt-6">
                {edition === "2014" ? (
                    <CRTable data={CR_MATRIX_2014_FULL}/>
                ) : (
                    <CRTable data={CR_MATRIX_2024_FULL}/>
                )}
            </div>

            <p className="mt-8 text-xs text-zinc-500">
                Based on 5e 2014 DMG and 2024 Update guidelines with minor range smoothing.
            </p>
        </section>
    );
}
