export const metadata = {
    title: "Encounter Builder – How it works",
    description: "Full reference for XP and CR-match modes, battlefield tools, cover rules, and suggestion logic used by CRializr.",
};

function Code({ children }: { children: React.ReactNode }) {
    return <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">{children}</code>;
}

export default function BalanceDocsPage() {
    return (
        <section className="prose prose-invert max-w-3xl px-4 py-8">
            <h1 className="mb-2 text-3xl font-semibold">Encounter Builder – How it works</h1>
            <p className="text-zinc-400">
                Complete reference for every feature in the Encounter Builder — party setup, two calculation
                modes, the interactive battlefield, and cover mechanics.
            </p>

            {/* ── INPUTS ──────────────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Inputs</h2>
            <ul>
                <li><strong>Party size</strong> — number of characters (1–8). Quick-preset chips for 3/4/5/6.</li>
                <li><strong>Average level</strong> — 1–20. Drives both XP thresholds and CR target calculations.</li>
                <li><strong>Difficulty</strong> — <Code>easy</Code>, <Code>medium</Code>, <Code>hard</Code>, or <Code>deadly</Code>.</li>
                <li><strong>Ruleset</strong> — 2014 DMG or 2024 Player&apos;s Handbook tables.</li>
                <li><strong>Formation</strong> — <em>Solo Boss</em> (one dominant enemy, optionally with minions) or <em>Horde/Group</em> (mixed-CR mob).</li>
            </ul>

            {/* ── CALCULATION MODES ───────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Calculation Mode</h2>
            <p>
                The <strong>Calculation Mode</strong> toggle switches between two distinct approaches. Both
                produce the same suggestion card format; what changes is the math behind them.
            </p>

            <h3 className="mt-4 font-semibold">XP Budget mode (default)</h3>
            <p>Full D&amp;D 5e encounter-budget flow:</p>
            <ol>
                <li>Look up the per-character XP threshold for the chosen level and difficulty.</li>
                <li>Multiply by party size: <Code>budget = threshold[level][difficulty] × partySize</Code>.</li>
                <li>For each candidate group of monsters, compute:<br />
                    <Code>adjustedXP = Σ(count × xpEach) × encounterMultiplier(totalCount)</Code>
                </li>
                <li>Keep suggestions where <Code>fit = min(budget, adjustedXP) / max(budget, adjustedXP) ≥ 0.7</Code>.</li>
                <li>Sort by highest fit, then lower adjustedXP. Return top 12.</li>
            </ol>
            <p>The <strong>Budget Type</strong> sub-toggle switches between <em>Encounter budget</em> (single
                session) and <em>Daily budget</em> (≈3.4× encounter budget, for full adventuring days).</p>

            <h4 className="mt-3 font-medium">Encounter multipliers</h4>
            <ul>
                <li>1 monster → <Code>×1</Code></li>
                <li>2 → <Code>×1.5</Code></li>
                <li>3–6 → <Code>×2</Code></li>
                <li>7–10 → <Code>×2.5</Code></li>
                <li>11–14 → <Code>×3</Code></li>
                <li>15+ → <Code>×4</Code></li>
            </ul>

            <h3 className="mt-4 font-semibold">CR Match mode</h3>
            <p>No XP math. Suggestions are generated purely by comparing challenge ratings to the party level:</p>
            <ol>
                <li>Compute a <strong>target CR</strong> per difficulty offset:<br />
                    <Code>easy: level−2 · medium: level · hard: level+1 · deadly: level+3</Code> (min 1/8)
                </li>
                <li>Scale by party size: <Code>crBudget = targetCR × (partySize / 4)</Code>.</li>
                <li>For each candidate group, compute a <strong>CR encounter weight</strong>:<br />
                    <Code>crWeight = Σ(cr × count) × √encounterMultiplier(totalCount)</Code>
                </li>
                <li>Keep suggestions where <Code>fit = min(crBudget, crWeight) / max(crBudget, crWeight) ≥ 0.5</Code>.</li>
            </ol>
            <p>
                The <strong>Max Beatable CR</strong> displayed in the party card is <Code>crTarget × (partySize / 4)</Code>,
                formatted as a challenge rating — the single-monster ceiling the party can handle at the
                selected difficulty.
            </p>
            <p>
                No accuracy labels (On Target / Over Budget) are shown in CR Match mode because the CR tables
                already define an unambiguous answer; percentage fit is redundant.
            </p>

            {/* ── SOLO vs GROUP ───────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Solo Boss vs Horde/Group</h2>
            <h3 className="mt-3 font-semibold">Solo Boss</h3>
            <p>
                Enumerates boss CRs near the target, optionally pairing them with lower-CR minions. With
                <strong> Include Minions</strong> on, the tool searches for related monsters (by terrain,
                affiliation, or genus via the Relation Filter) to populate the minion slot.
            </p>
            <h3 className="mt-3 font-semibold">Horde / Group</h3>
            <p>
                Builds mixed-CR compositions. The <strong>Mix Types</strong> setting (2–5) caps how many distinct
                CR types appear in one suggestion. For N total monsters and T types:
            </p>
            <ul>
                <li>Enumerate all CR combinations of size T.</li>
                <li>Enumerate all ways to split N into T positive integer counts.</li>
                <li>Keep combinations whose budget fit meets the threshold.</li>
            </ul>

            {/* ── RELATION FILTER ─────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Relation Filter</h2>
            <p>
                Available when minions are enabled (Solo) or always in Group mode. Restricts candidates to
                monsters that share a chosen property with a benchmark creature at the target CR:
            </p>
            <ul>
                <li><strong>Any Species</strong> — no filter.</li>
                <li><strong>Same Terrain</strong> — monsters whose terrain list overlaps.</li>
                <li><strong>Same Affiliation</strong> — monsters with the same faction tag.</li>
                <li><strong>Same Genus</strong> — monsters of the same creature genus (e.g., undead, dragon).</li>
            </ul>

            {/* ── BATTLEFIELD MAP ─────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Battlefield Map</h2>
            <p>
                An interactive flat-top hex grid rendered with React Konva. Party members (green) and enemies
                (gold/red for bosses) are placed automatically when a suggestion is selected. All nodes are
                draggable.
            </p>

            <h3 className="mt-4 font-semibold">Toolbar modes</h3>
            <ul>
                <li><Code>W</Code> — <strong>Move</strong>: drag nodes freely. Multi-select with Ctrl/Cmd/Shift+click to drag several nodes at once.</li>
                <li><Code>A</Code> — <strong>Env Hazard</strong>: click an empty hex to place an environment hazard (orange).</li>
                <li><Code>S</Code> — <strong>Spell Hazard</strong>: click an empty hex to place a spell hazard (purple).</li>
                <li><Code>C</Code> — <strong>Cover</strong>: click an empty hex to place a cover obstacle (bright blue).</li>
                <li><Code>L</Code> — <strong>Lock Camera</strong>: freezes panning while you drag nodes.</li>
                <li><Code>+</Code> / <Code>−</Code> — zoom in / out.</li>
                <li><Code>Esc</Code> — return to Move mode and unlock camera.</li>
            </ul>

            <h3 className="mt-4 font-semibold">Removing nodes</h3>
            <p>
                Each node shows a small <Code>×</Code> button. Removing a party node decrements the outer
                party size counter. Removing an enemy node persists across re-syncs from the same suggestion
                (tracked via <Code>removedEnemyCount</Code>) and resets only when a new suggestion is selected.
            </p>

            <h3 className="mt-4 font-semibold">Grid</h3>
            <p>
                The grid is infinite in all directions (no bounds). Pan by dragging the background.
                Pinch-to-zoom works on touch devices. The view auto-centers on the current encounter nodes
                whenever the suggestion or party size changes.
            </p>

            <h3 className="mt-4 font-semibold">Mobile fullscreen</h3>
            <p>
                On mobile, tap the fullscreen button to open the battlefield as a full-screen overlay with a
                touch-friendly bottom toolbar. Tap <strong>← Exit</strong> to return.
            </p>

            {/* ── HAZARDS ─────────────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Hazards &amp; Area of Effect</h2>
            <p>
                Both hazard types (environment and spell) support an <strong>AoE radius</strong> (0–3 hexes,
                default 1). After placing a hazard, open its editor to adjust the radius.
            </p>
            <ul>
                <li>The AoE fills surrounding hexes with a matching tint (orange = env, purple = spell).</li>
                <li>Any <strong>Cover node</strong> within the AoE turns the hex blue — the cover blocks the hazard there.</li>
                <li>Party or enemy nodes inside an unprotected AoE hex glow with the hazard&apos;s colour.</li>
                <li>Hazards stack on top of any other node. Cover, party, and enemy nodes remain exclusive (one per hex).</li>
            </ul>

            {/* ── COVER ───────────────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Cover</h2>
            <p>Cover follows standard D&amp;D 5e rules. Three levels are available via the node editor:</p>
            <ul>
                <li><strong>Half Cover</strong> — +2 bonus to AC and Dexterity saving throws.</li>
                <li><strong>Three-Quarters Cover</strong> — +5 bonus to AC and Dexterity saving throws.</li>
                <li><strong>Full Cover</strong> — cannot be targeted directly by attacks or spells.</li>
            </ul>
            <p>
                The <strong>Advantages / Disadvantages</strong> section in the Party card automatically lists
                every party member who is adjacent (1 hex away) to a cover node, showing the best cover level
                available. The <Code>C</Code> badge indicates the benefit comes from Cover.
            </p>

            {/* ── NODE EDITOR ─────────────────────────────────────────────── */}
            <h2 className="mt-8 text-xl font-semibold">Node Editor</h2>
            <p>
                Click any node to open its popover. Available fields vary by node type:
            </p>
            <ul>
                <li><strong>All nodes</strong> — custom label.</li>
                <li><strong>Hazards</strong> — notes text and AoE radius (0 = single hex, 1–3 = expanding rings).</li>
                <li><strong>Cover</strong> — cover level (Half / Three-Quarters / Full).</li>
            </ul>

            <p className="mt-8 text-sm text-zinc-500">
                Rules basis: D&amp;D 5e 2014 DMG encounter building guidelines and PHB cover rules. Use as a
                starting point and adjust to your table.
            </p>
        </section>
    );
}
