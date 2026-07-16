# Changelog

All notable changes are documented here. Versioning follows [Semantic Versioning](https://semver.org/):
- **MAJOR** bump for breaking redesigns or complete feature overhauls.
- **MINOR** bump for new features or significant additions.
- **PATCH** bump for bug fixes, copy changes, and small UI tweaks.

---

## [Unreleased]

### Added
- **Combat Tracker (Battle Mode)** — the Encounter Builder now has a full prep-vs-execute flow. **Start Encounter** seeds an initiative tracker from the map's party/enemy nodes and switches the battlefield into fullscreen Battle Mode automatically.
  - Enemy combatants get a real monster auto-assigned from the current ruleset's catalog (official + your homebrew), pulling in AC, max HP, DEX modifier, and a collapsible actions list instead of staying CR-abstract.
  - Initiative can be rolled per combatant (`1d20 + DEX modifier`), showing the roll breakdown (e.g. `14 (11 +3)`) until edited by hand.
  - HP tracking with quick apply-damage/apply-healing, SRD conditions, and death save success/failure tracking for party members at 0 HP (auto-clears once healed above 0).
  - **Pause** exits fullscreen without ending combat (round/turn/HP/conditions persist); **Resume Battle Mode** re-enters fullscreen and folds in any new party/enemy nodes placed while paused — an NPC ally arriving, a boss's reinforcements — as fresh combatants, without disturbing anyone already fighting. **End Encounter** ends the session.
  - Combat state persists to IndexedDB, including migration of older saved sessions to the current data shape.
  - Per-combatant "swap monster" picker, restricted to the encounter's own challenge rating so it can't silently re-budget a fight already in progress.

### Changed
- Merged the Encounter Builder's XP threshold / XP-per-CR / encounter-multiplier tables, which had been duplicated identically per ruleset — 2014 and 2024 use the same DMG numbers for this math; only the Monster Manual catalog and Exhaustion's mechanics genuinely differ by ruleset.
- Docs corrected to stop implying CR Match mode's target-CR formula comes from the DMG — it's CRealizr's own simplified heuristic, not a printed table.

### Fixed
- Death saves weren't clearing when a downed combatant regained HP, so a later drop back to 0 resumed from stale pips instead of a fresh set.

---

## [1.4.2] – 2026-07-16

### Changed
- Disclaimer: split the AI-development disclosure out of "No Artificial Intelligence" into its own **AI Acknowledgement** section, so the no-generative-AI-in-tools claim and the local-dev-tooling disclosure read as two distinct statements. Translated across all 6 locales.

---

## [1.4.1] – 2026-07-16

### Fixed
- Canonical URLs fixed across every route, not just the homepage — every locale's page now self-references its own full URL instead of collapsing to the locale root.
- Accessibility: pinch-zoom re-enabled (was disabled via viewport meta), text contrast raised on several small labels/badges, inline links no longer rely on color alone.
- Reverted D&D abbreviations (AC/HP/DPR/DC) that had been mistakenly translated in several locales back to English, per project convention.
- Hero carousel slide transition fixed — was cutting instantly instead of crossfading; CSS transitions smoothed after the framer-motion removal below.
- Performance: removed framer-motion from root-layout components (Numpad, Picker, CrealizrMark) and the homepage hero, removed an unnecessary redirect round-trip on `/`, added cache lifetimes for static assets, fixed an LCP-blocking hero fade-in and unnecessary font preloads.

---

## [1.4.0] – 2026-07-14

### Added
- Per-locale display serif fonts (Cinzel for Latin-script locales, Yeseva One for Russian, Gentium Plus for Greek).
- Dragon icon on encounter suggestion cards, restyled unboxed hero carousel arrows, dice-roll shuffle animation for Travel Encounters.

### Changed
- Cleaned up mobile pipe (`|`) separators that only make sense in single-line layouts.

---

## [1.3.2] – 2026-07-14

### Changed
- Documented the `DND-NNNN` branch naming and release-before-push git convention in `CLAUDE.md`.

---

## [1.3.1] – 2026-07-14

### Fixed
- Mobile safe-area padding for the dynamic viewport (URL bar show/hide no longer leaves content flush against the screen edge).
- Loading screen now only appears on top-level tool navigation, not every route change.
- JSON-LD structured data script warning.

---

## [1.3.0] – 2026-07-14

### Added
- My Bestiary CRUD-style URLs (`/my-monsters/add`, `/my-monsters/edit/[id]`).
- PWA "Add to Home Screen" install prompt/badge.
- Homepage remade with a narrative hero carousel; Instagram/GitHub social links.

### Changed
- Refactor: types/functions separated across atomic-design tiers.
- Generic UI cleanup/homogeneity pass, translation updates.
- Fixed version bump reliability on Hostinger's shallow git clone.

---

## [1.2.0] – 2026-07-10

### Added
- PWA support usable offline once installed — service worker fixed to match Hostinger's Linux hosting environment.
- Per-language font sizing; PWA install prompt.
- Google Tag Manager cookie consent.
- Legal pages (Privacy Policy, Terms, Disclaimer) with a custom cookie/privacy consent banner.

### Fixed
- Loader color fix; deployment version-increment issue.

---

## [1.1.0] – 2026-07-07

### Added
- Open Graph share-thumbnail images for social sharing.

### Fixed
- CI/CD dependency and TypeScript build issues; a mobile UI fix.

---

## [1.0.0] – 2026-07-07

### Added
- Encounter Builder: shift+drag rubber-band multiselect, Delete/Backspace to remove selected nodes.
- Custom mobile-friendly select control; hazards & conditions list.
- Homepage revamp.

### Fixed
- Duplicate `<html>`/`<body>` across the root and locale layouts that was breaking GTM tag verification.
- CLS from an undersized `content-visibility` placeholder; LCP/Speed Index from expensive blur filters behind the hero text.
- Mobile sidebar toggle only ever reopening on iOS.
- Footer logo on mobile; SEO for page load times.
- Contact form injection guardrails.

---

## [0.6.0] – 2026-07-06

### Fixed
- Agentic-browsing issues flagged by PageSpeed Insights.
- Google Analytics 4 implementation brought in line with Google's recommended settings.

---

## [0.5.0] – 2026-07-05

### Added
- **AoE Hazard system** — environment (orange) and spell (purple) hazards now support a configurable AoE radius (0–3 hexes). All hexes within the radius are tinted and any nodes inside glow with the hazard colour.
- **Cover blocking** — any Cover node within a hazard's AoE blocks the effect there (hex turns blue).
- **Cover nodes** — bright-blue hex obstacles with D&D 5e levels: Half Cover (+2 AC/Dex), Three-Quarters Cover (+5 AC/Dex), Full Cover (can't be targeted).
- **Advantages / Disadvantages panel** — auto-populated under Party information. Shows every party member adjacent (1 hex) to a cover node with the best available cover level and a `C` badge.
- **Keyboard shortcuts** — `A` Env Hazard · `S` Spell Hazard · `C` Cover · `W` Move · `L` Lock Camera · `+`/`−` Zoom · `Esc` Reset.
- **CR Match mode** — XP toggle switches encounter calculations to a pure CR-table comparison (`crTarget`, `crEncounterWeight`, `crBudgetForParty`). No accuracy labels shown in this mode.
- **Max Beatable CR** — replaces "CR Threat Budget" label; shows the highest CR the party can handle at the chosen difficulty.
- **Check Monsters button** — renamed from "Monsters", now a solid gold pill for clarity.
- **Versioning in footer** — footer now displays the version string from `package.json` automatically.
- **Encounter builder docs** — full reference page rewritten covering both calculation modes, all toolbar shortcuts, AoE system, cover rules, and node editor.

### Changed
- **Performance** — React Compiler always active in production; `optimizePackageImports` for framer-motion/konva/react-konva; `monster-scaler/docs` page converted to Server Component with isolated Client island.
- Removed `WhyDifferent` from Encounter Builder, Artifact Forge, and Home page headers.

### Fixed
- Locale redirects preserved in `next.config.ts` through config refactor.

---

## [0.4.0] – 2026-06 *(prior session)*

### Added
- Interactive battlefield hex map (React Konva): drag nodes, multi-select, zoom/pan, mobile fullscreen.
- Hazard nodes (environment / spell) with AoE radius placeholder.
- Cover node placement.
- Party and enemy nodes auto-placed from suggestion; removal tracked per-suggestion.

---

## [0.3.0]

### Added
- PWA support (`next-pwa`) with service worker runtime caching.
- 3-column encounter + hex map layout.
- SliderToggle component.
- SVG sidebar icons.
- Accessibility audit pass.

---

## [0.2.0]

### Added
- Encounter Builder: XP-budget suggestions (solo boss + horde modes), relation filter, mix-types setting.
- Monster Scaler: CR matrix lookup, HP/AC/stat scaling, DPR estimation.
- Travel Encounters generator.
- Artifact Forge.
- i18n with `next-intl` (en, el, ru, de, fr, it).

---

## [0.1.0] – initial release

- Project scaffolded with Next.js 16, React 19, TypeScript, Tailwind CSS 4.
