export const metadata = {
  title: "Monster CR Scaler – How it works",
  description: "Detailed description of the 2014 CR scaling workflow and formulas used by CRializr.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">{children}</code>
  );
}

export default function ScaleDocsPage() {
  return (
    <section className="prose prose-invert max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-semibold">Monster CR Scaler (2014) – How it works</h1>
      <p className="text-zinc-400">This page documents the exact steps and formulas used by the Monster CR Scaler for the 2014 ruleset. The goal is transparency so you can understand, audit, and adapt the results at your table.</p>

      <h2 className="mt-8 text-xl font-semibold">Inputs</h2>
      <ul>
        <li>Source monster stat block: name, size/type, current <Code>challenge_rating</Code>, and <Code>stats</Code> (AC, HP, STR/DEX/CON/INT/WIS/CHA).</li>
        <li>Optional action list used to estimate DPR from damage expressions (e.g., <Code>1d6+2</Code>).</li>
        <li>Target CR (supports fractional CRs 1/8, 1/4, 1/2 and CR 1–30).</li>
        <li>Optional bonuses: <Code>acEquipment</Code>, <Code>acRace</Code>, and per-ability <Code>abilityScoreBonus</Code>.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">CR row lookup</h2>
      <p>We look up two rows from the internal 2014 CR matrix: one for the source CR and one for the target CR. Each row contains reference values like proficiency bonus, expected AC, HP, attack bonus, DPR, and save DC.</p>
      <p>Implementation: <Code>findCRRow(cr)</Code> picks the highest row with <Code>row.cr ≤ cr</Code>.</p>

      <h2 className="mt-8 text-xl font-semibold">Damage per round (DPR) estimation</h2>
      <p>If the monster has actions with damage strings, we estimate average damage for each action and sum:</p>
      <ul>
        <li>For each token like <Code>X d Y</Code> (e.g., <Code>2d6</Code>), expected value = <Code>X × (Y + 1) / 2</Code>.</li>
        <li>An optional flat modifier <Code>±N</Code> is added once to that action’s total.</li>
        <li>Non-dice numbers are parsed as a flat value where possible.</li>
      </ul>
      <p>The per-action averages are summed and rounded to nearest integer. If no actions are provided, we use <Code>1</Code>.</p>

      <h2 className="mt-8 text-xl font-semibold">HP scaling</h2>
      <p>HP is scaled proportionally from the source monster’s HP to the target row’s expected HP:</p>
      <p><Code>hpScale = tgtRow.hp / max(1, srcHP)</Code></p>
      <p><Code>finalHP = round(srcHP × hpScale)</Code>, with a minimum of 1.</p>

      <h2 className="mt-8 text-xl font-semibold">AC scaling</h2>
      <ul>
        <li>Compute raw delta: <Code>Δ = tgtRow.ac − srcAC</Code>.</li>
        <li>Apply at most ±2 points toward the target: <Code>finalAC_raw = clamp(srcAC + sign(Δ) × min(2, |Δ|), 5, 30)</Code>.</li>
        <li>Then apply user-supplied bonuses: <Code>finalAC = finalAC_raw + acEquipment + acRace</Code> (each optional).</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Ability score scaling (STR/DEX/CON/INT/WIS/CHA)</h2>
      <p>We scale ability scores by modifier steps, not by raw points:</p>
      <ol>
        <li>Compute CR difference: <Code>crDiff = targetCR − sourceCR</Code>.</li>
        <li>Increase the ability modifier by <Code>floor(crDiff / 2)</Code> steps. Example: from CR 1 to CR 5, <Code>crDiff=4</Code> ⇒ <Code>+2</Code> modifier steps.</li>
        <li>Map the new modifier back to the nearest canonical score using the standard “score ⇒ modifier” table.</li>
        <li>Apply any per-ability bonus (<Code>abilityScoreBonus</Code>), then clamp to the 1–30 range.</li>
      </ol>
      <p>HP and AC are explicitly excluded from this loop since they are handled by the formulas above.</p>

      <h2 className="mt-8 text-xl font-semibold">Attack bonus advice</h2>
      <p>We provide a suggested attack bonus to help you tune actions:</p>
      <ul>
        <li>Determine the best attack ability modifier: <Code>atkAbilityMod = max(mod(STR), mod(DEX))</Code> for the scaled stats.</li>
        <li>Compute how the matrix’s baseline attack bonus changes: <Code>attackDelta = tgtRow.atkb − srcRow.atkb</Code>.</li>
        <li>Adjust for the change in the monster’s own attack stat mod (scaled vs. source): <Code>atkAbilityMod − srcAtkMod</Code>.</li>
        <li>Suggested: <Code>finalAttackBonus = round(srcRow.atkb + attackDelta + atkAbilityMod − srcAtkMod)</Code>.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Save DC advice</h2>
      <p>Suggested save DC starts from the target row’s DC and shifts with the monster’s INT modifier change (as a simple spellcasting‑style proxy):</p>
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
      <p>The scaler supports CR 1/8, 1/4, 1/2 and 1–30. Internally, target/source rows are selected by ≤ logic, so a non‑listed CR value will use the nearest lower row.</p>

      <h2 className="mt-8 text-xl font-semibold">Randomness note</h2>
      <p>The in‑app 2014 CR matrix spans the DMG ranges and includes some randomized values for AC/HP/DPR within official bands to avoid singular results. The production app uses the real matrix; you can always override outcomes via the bonuses described above.</p>

      <h2 className="mt-8 text-xl font-semibold">Where this lives in code</h2>
      <ul>
        <li>Scaler implementation: <Code>src/app/utils/scaler.ts</Code> (function <Code>scaleMonster2014</Code> and helpers).</li>
        <li>Constants and CR matrix: <Code>src/app/data/constants.ts</Code>.</li>
        <li>UI: <Code>src/app/scale/page.tsx</Code>.</li>
      </ul>

      <p className="mt-8 text-sm text-zinc-500">Rules basis: D&D 5e 2014 DMG guidelines, adapted for quick mobile use. Always adjust to taste for your table.</p>
    </section>
  );
}
