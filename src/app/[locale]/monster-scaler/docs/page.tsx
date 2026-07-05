import { CRTableToggle } from "./CRTableToggle";

export const metadata = {
    title: "Monster Scaler – How it works",
    description: "Documents the CR scaling formulas, matrix lookup, HP/AC/stat scaling, and DPR estimation used by CRializr.",
};

function Code({ children }: { children: React.ReactNode }) {
    return <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">{children}</code>;
}

export default function ScaleDocsPage() {
    return (
        <section className="prose prose-invert max-w-3xl px-4 py-8">
            <h1 className="mb-2 text-3xl font-semibold">Monster Scaler – How it works</h1>
            <p className="text-zinc-400">This page documents the exact steps and formulas used by the Monster Scaler.
                Toggle 2014 or 2024 to swap the matrix data while keeping the same workflow.</p>

            <h2 className="mt-8 text-xl font-semibold">Inputs</h2>
            <ul>
                <li>Source monster stat block: name, size/type, current <Code>cr</Code>,
                    and <Code>stats</Code> (AC, HP, STR/DEX/CON/INT/WIS/CHA).
                </li>
                <li>Optional action list used to estimate DPR from damage expressions (e.g., <Code>1d6+2</Code>).</li>
                <li>Target CR (supports fractional CRs 1/8, 1/4, 1/2 and CR 1–30).</li>
                <li>Optional bonuses: <Code>acEquipment</Code>, <Code>acRace</Code>, and
                    per-ability <Code>abilityScoreBonus</Code>.
                </li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">CR row lookup</h2>
            <p>We look up two rows from the CR matrix: one for the source CR (<Code>srcRow</Code>) and one for
                the target CR (<Code>tgtRow</Code>). Each row contains reference values for proficiency bonus,
                expected AC, HP, attack bonus, DPR, and save DC.</p>
            <p>Implementation: <Code>findCRRow(cr)</Code> picks the highest row with <Code>row.cr ≤ cr</Code>.</p>

            <h2 className="mt-8 text-xl font-semibold">Damage per round (DPR) estimation</h2>
            <p>If the monster has actions with damage strings, we estimate average damage for each action and sum:</p>
            <ul>
                <li>For each token like <Code>XdY</Code> (e.g., <Code>2d6</Code>), expected value = <Code>X × (Y + 1) / 2</Code>.</li>
                <li>An optional flat modifier <Code>±N</Code> is added once to that action&apos;s total.</li>
                <li>Non-dice numbers are parsed as a flat value where possible.</li>
            </ul>
            <p>The per-action averages are summed and rounded to nearest integer. If no actions are provided,
                the scaler skips the DPR ratio and shows the target CR&apos;s expected DPR as an absolute reference
                instead.</p>

            <h2 className="mt-8 text-xl font-semibold">HP scaling</h2>
            <p>HP is scaled proportionally, preserving how far above or below the CR baseline the original
                monster sits:</p>
            <p><Code>hpScale = tgtRow.hp / max(1, srcRow.hp)</Code></p>
            <p><Code>finalHP = round(srcHP × hpScale)</Code>, with a minimum of 1.</p>
            <p className="text-zinc-400 text-sm">Example: a CR 1 monster with 156 HP (2× the CR 1 baseline of
                78) scaled to CR 5 (baseline 138) yields <Code>round(156 × 138/78) = 276</Code> — still
                roughly 2× the CR 5 baseline.</p>

            <h2 className="mt-8 text-xl font-semibold">AC scaling</h2>
            <ul>
                <li>Compute raw delta: <Code>Δ = tgtRow.ac − srcAC</Code>.</li>
                <li>Apply <strong>at most ±2 points</strong> toward the target regardless of how large the CR
                    gap is — this is a deliberate guardrail, since AC in D&D changes slowly and a large CR jump
                    should not dramatically alter a creature&apos;s defensive profile:
                    <Code>finalAC_raw = clamp(srcAC + sign(Δ) × min(2, |Δ|), 5, 30)</Code>.
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
                <li>Map the new modifier back to the nearest canonical score using the standard "score ⇒ modifier"
                    table.
                </li>
                <li>Apply any per-ability bonus (<Code>abilityScoreBonus</Code>), then clamp to the 1–30 range.</li>
            </ol>

            <h2 className="mt-8 text-xl font-semibold">Attack bonus advice</h2>
            <ul>
                <li>Best attack ability modifier: <Code>atkAbilityMod = max(mod(STR), mod(DEX))</Code> for scaled stats.</li>
                <li>Matrix baseline change: <Code>attackDelta = tgtRow.atkb − srcRow.atkb</Code>.</li>
                <li>Adjust for the monster&apos;s own stat change: <Code>atkAbilityMod − srcAtkMod</Code>.</li>
                <li>Suggested: <Code>finalAttackBonus = round(srcRow.atkb + attackDelta + atkAbilityMod − srcAtkMod)</Code>.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Save DC advice</h2>
            <p>Suggested save DC starts from the target row&apos;s DC and shifts with the monster&apos;s INT modifier
                change (as a spellcasting-style proxy):</p>
            <p><Code>finalSaveDC = tgtRow.save_dc + (mod(INT_scaled) − mod(INT_source))</Code></p>

            <h2 className="mt-8 text-xl font-semibold">DPR reference</h2>
            <p>When actions are provided, the scaler reports a scale factor to help you retune damage:</p>
            <ul>
                <li><Code>srcDPR</Code>: estimated from input actions.</li>
                <li><Code>tgtDPR</Code>: matrix value for target CR.</li>
                <li><Code>dprScale = tgtDPR / max(1, srcDPR)</Code> — multiply each action&apos;s damage by this to hit the target band.</li>
            </ul>
            <p>When no actions are provided, <Code>dprScale</Code> is omitted and <Code>tgtDPR</Code> is shown
                as an absolute reference for the target CR.</p>

            <h2 className="mt-8 text-xl font-semibold">Bounds and clamps</h2>
            <ul>
                <li>AC is clamped to 5–30 after all adjustments.</li>
                <li>Ability scores are clamped to 1–30.</li>
                <li>HP has a minimum of 1.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold">Determinism</h2>
            <p>The scaler is fully deterministic. All matrix values are the midpoint of the official DMG ranges.
                No randomness is applied at runtime — same inputs always produce the same output.</p>

            <h2 className="mt-12 text-xl font-semibold">CR Matrix Reference</h2>
            <p className="text-zinc-400">
                These are the exact baseline values used by the scaler, taken directly from the live data layer.
            </p>

            <CRTableToggle />

            <p className="mt-8 text-xs text-zinc-500">
                HP values are midpoints of the 2014 DMG CR table ranges. Attack bonuses and Save DCs match
                the official table exactly.
            </p>
        </section>
    );
}
