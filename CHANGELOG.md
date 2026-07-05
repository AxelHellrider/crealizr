# Changelog

All notable changes are documented here. Versioning follows [Semantic Versioning](https://semver.org/):
- **MAJOR** bump for breaking redesigns or complete feature overhauls.
- **MINOR** bump for new features or significant additions.
- **PATCH** bump for bug fixes, copy changes, and small UI tweaks.

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
