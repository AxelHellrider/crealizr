export const metadata = {
  title: "Combat Balancer – How it works",
  description: "Explains XP thresholds, multipliers, budgets, and suggestion logic used by CRializr.",
};

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">{children}</code>;
}

export default function BalanceDocsPage() {
  return (
    <section className="prose prose-invert max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-semibold">Combat Balancer – How it works</h1>
      <p className="text-zinc-400">This page documents the simple 2014 DMG encounter math used to generate suggestions.</p>

      <h2 className="mt-8 text-xl font-semibold">Inputs</h2>
      <ul>
        <li>Party size: number of characters.</li>
        <li>Average level: 1–20. Rounded and clamped to the 2014 DMG table.</li>
        <li>Difficulty: one of <Code>easy</Code>, <Code>medium</Code>, <Code>hard</Code>, <Code>deadly</Code>.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">XP thresholds (2014 DMG)</h2>
      <p>For each level L, we use per‑character thresholds for each difficulty. The party XP budget is:</p>
      <p><Code>budget = thresholds[L][difficulty] × partySize</Code></p>

      <h2 className="mt-8 text-xl font-semibold">Monster XP by CR</h2>
      <p>Each creature’s base XP is taken from the 2014 table by its challenge rating (supports 0, 1/8, 1/4, 1/2, 1–30).</p>

      <h2 className="mt-8 text-xl font-semibold">Encounter multipliers</h2>
      <p>Per DMG, multiple foes increase the effective XP via a multiplier:</p>
      <ul>
        <li>1 → <Code>×1</Code></li>
        <li>2 → <Code>×1.5</Code></li>
        <li>3–6 → <Code>×2</Code></li>
        <li>7–10 → <Code>×2.5</Code></li>
        <li>11–14 → <Code>×3</Code></li>
        <li>15+ → <Code>×4</Code></li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Adjusted XP</h2>
      <p>For N identical creatures of CR C with base XP <Code>xpEach</Code>:</p>
      <p><Code>adjustedXP = round(xpEach × N × multiplier(N))</Code></p>

      <h2 className="mt-8 text-xl font-semibold">Suggestion search</h2>
      <ul>
        <li>Enumerate CR values and counts N from 1 to 8.</li>
        <li>Compute <Code>adjustedXP</Code> and a budget fit metric: <Code>fit = min(budget, adjustedXP) / max(budget, adjustedXP)</Code>.</li>
        <li>Keep suggestions with <Code>fit ≥ 0.7</Code>.</li>
        <li>Sort by highest <Code>fit</Code>, then by lower <Code>adjustedXP</Code>. Return the top 12.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Ruleset and Modes</h2>
      <p>The page includes a Ruleset toggle to switch between the 2014 and 2024 guidelines. XP thresholds, per‑CR XP, and multipliers come from the selected ruleset.</p>
      <p className="text-zinc-400 text-sm">Note: For initial 2024 support, values align closely to 2014 to provide parity; you can still tune outcomes at your table.</p>
      <h3 className="mt-4 font-semibold">Solo vs Groups</h3>
      <p>The UI lets you toggle between two suggestion modes:</p>
      <ul>
        <li>
          Solo (identical foes): Uses a single CR repeated N times. This is the classic DMG flow where all monsters share a CR.
        </li>
        <li>
          Groups (mixed CRs): Builds small combinations of different CRs that spend the same XP budget with the multiplier applied.
        </li>
      </ul>
      <p>In Groups mode, for a total count N we estimate a target per-creature base XP as:</p>
      <p><Code>targetPer = budget / (multiplier(N) × N)</Code></p>
      <p>We then pick a handful of CRs whose base XP is closest to <Code>targetPer</Code> and enumerate compact mixes:</p>
      <ul>
        <li>Two-type mixes: <Code>k</Code> of CR A and <Code>N − k</Code> of CR B, for 1 ≤ k ≤ N−1.</li>
        <li>Three-type mixes for small N (≤5) to add variety, splitting N into x+y+z.</li>
      </ul>
      <p>For each mix, adjusted XP is:</p>
      <p><Code>adjustedXP = round((Σ countᵢ × xpEachᵢ) × multiplier(N))</Code></p>
      <p>We compute the same fit metric and keep mixes with <Code>fit ≥ 0.7</Code>, deduplicate by CR×count, sort, and return the top 12.</p>

      <p className="mt-8 text-sm text-zinc-500">Rules basis: D&D 5e 2014 DMG encounter building guidelines. Use as a starting point and adjust to your table.</p>
    </section>
  );
}
