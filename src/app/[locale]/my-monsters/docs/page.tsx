export const metadata = {
  title: "My Monsters – Field Reference",
  description: "Explains every field in the My Monsters form and how homebrew monsters integrate with CRealizr tools.",
};

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">{children}</code>;
}

export default function MyMonstersDocsPage() {
  return (
    <section className="prose prose-invert max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-semibold">My Monsters – Field Reference</h1>
      <p className="text-zinc-400">
        This page documents every field available when creating or editing a homebrew monster, how monsters are stored, and how they integrate with other CRealizr tools.
      </p>

      {/* ── Identity ── */}
      <h2 className="mt-8 text-xl font-semibold">Identity</h2>
      <ul>
        <li><strong>Name</strong> — the monster&rsquo;s display name. Must be unique within your library (case-insensitive).</li>
        <li><strong>Size</strong> — one of <Code>Tiny</Code>, <Code>Small</Code>, <Code>Medium</Code>, <Code>Large</Code>, <Code>Huge</Code>, or <Code>Gargantuan</Code>. Matches the 5e size categories.</li>
        <li><strong>Type</strong> — a free-text creature type (e.g. &ldquo;monstrosity&rdquo;, &ldquo;undead&rdquo;). Informational only; not used for filtering.</li>
        <li><strong>Alignment</strong> — a free-text alignment string (e.g. &ldquo;chaotic evil&rdquo;). Informational only.</li>
      </ul>

      {/* ── Edition & CR ── */}
      <h2 className="mt-8 text-xl font-semibold">Edition, CR &amp; XP</h2>
      <ul>
        <li><strong>Edition</strong> — <Code>2014</Code> or <Code>2024</Code>. Determines which XP and threshold tables apply when the Encounter Builder uses this monster.</li>
        <li><strong>Challenge Rating (CR)</strong> — ranges from 0 to 30 (including 1/8, 1/4, 1/2). The Encounter Builder uses CR to compute XP budgets and suggest encounter compositions.</li>
        <li><strong>XP</strong> — experience points awarded for defeating this monster. If set to 0, the Encounter Builder falls back to the standard XP-by-CR table.</li>
      </ul>

      {/* ── Stat Block ── */}
      <h2 className="mt-8 text-xl font-semibold">Stat Block</h2>
      <p>The stat block section is optional. Filling in any defense or ability score field enables the full stat block on save.</p>
      <ul>
        <li><strong>AC</strong> — Armor Class (0–30).</li>
        <li><strong>HP</strong> — Hit Points.</li>
        <li><strong>Speed</strong> — free-text (e.g. &ldquo;30 ft, fly 60 ft&rdquo;).</li>
        <li><strong>Ability Scores</strong> — STR, DEX, CON, INT, WIS, CHA (0–30 each). The modifier is calculated automatically as <Code>floor((score − 10) / 2)</Code>.</li>
      </ul>

      {/* ── DPR ── */}
      <h2 className="mt-8 text-xl font-semibold">Damage Per Round (DPR)</h2>
      <p>DPR fields help the Monster Scaler estimate how dangerous a creature is at different CRs.</p>
      <ul>
        <li><strong>DPR Min / Max</strong> — the low and high ends of expected damage output per round.</li>
        <li><strong>DPR Range</strong> — a human-readable dice expression (e.g. <Code>2d8+4</Code>).</li>
      </ul>

      {/* ── Actions ── */}
      <h2 className="mt-8 text-xl font-semibold">Actions</h2>
      <p>Add as many named actions as needed. Each action has:</p>
      <ul>
        <li><strong>Action Name</strong> — e.g. &ldquo;Multiattack&rdquo;, &ldquo;Bite&rdquo;.</li>
        <li><strong>Damage</strong> — optional dice expression (e.g. <Code>2d6+3</Code>).</li>
      </ul>

      {/* ── Encounter Data ── */}
      <h2 className="mt-8 text-xl font-semibold">Encounter Data</h2>
      <p>These fields control how your monster appears in the Encounter Builder&rsquo;s filtered monster pool.</p>
      <ul>
        <li>
          <strong>Terrain</strong> — one or more of <Code>dungeon</Code>, <Code>wilderness</Code>, <Code>urban</Code>, <Code>underwater</Code>, <Code>planar</Code>, or <Code>any</Code>.
          When the Encounter Builder filters by terrain, monsters tagged <Code>any</Code> always appear.
          You can select multiple terrains.
        </li>
        <li>
          <strong>Affiliation</strong> — the creature&rsquo;s broad category: <Code>humanoid</Code>, <Code>beast</Code>, <Code>undead</Code>, <Code>construct</Code>, <Code>dragon</Code>, <Code>fiend</Code>, <Code>celestial</Code>, <Code>fey</Code>, <Code>monstrosity</Code>, <Code>giant</Code>, <Code>elemental</Code>, <Code>aberration</Code>, <Code>plant</Code>, or <Code>any</Code>.
          The Encounter Builder uses this to filter suggestions by creature category.
        </li>
        <li>
          <strong>Genus</strong> — an optional grouping tag (e.g. &ldquo;goblinoid&rdquo;, &ldquo;dragon&rdquo;, &ldquo;owlbear&rdquo;).
          The autocomplete dropdown shows all genera already used across SRD and homebrew monsters.
          You can type a new genus or pick an existing one. Genus is used by the Encounter Builder to group thematically related creatures together.
        </li>
      </ul>

      {/* ── Storage & Portability ── */}
      <h2 className="mt-8 text-xl font-semibold">Storage &amp; Portability</h2>
      <ul>
        <li>Monsters are stored in your browser&rsquo;s <strong>IndexedDB</strong>. Clearing browser data removes them.</li>
        <li>Use <strong>Export</strong> to download your entire library as a JSON file. This is your backup.</li>
        <li>Use <strong>Import</strong> to restore from a previously exported JSON file. Duplicate names are skipped.</li>
        <li>Exported files can be shared with other DMs or transferred between devices.</li>
      </ul>

      {/* ── Cross-Tool Integration ── */}
      <h2 className="mt-8 text-xl font-semibold">Cross-Tool Integration</h2>
      <ul>
        <li><strong>Encounter Builder</strong> — homebrew monsters appear in the filtered monster pool alongside SRD creatures. They are matched by CR, terrain, affiliation, and genus.</li>
        <li><strong>Monster Scaler</strong> — homebrew monsters with a stat block can be loaded and scaled to different CRs.</li>
      </ul>

      <p className="mt-8 text-sm text-zinc-500">All fields follow D&D 5e conventions. Use this page as a reference when building your homebrew library.</p>
    </section>
  );
}
