CRializr is a mobile‑first toolkit for D&D 5e Dungeon Masters. It includes:

- Monster CR Scaler (2014) — scale stat blocks across CR 1/8 to 30
- Combat Balancer — encounter suggestions from party and difficulty
- Magic Item Creator — level‑tuned blueprinting for items

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key routes:

- `/monster-scaler` — Monster Scaler UI
- `/monster-scaler/docs` — How the Monster Scaler works (formulas and methods)
- `/encounter-builder` — Encounter Builder UI
- `/artifact-forge` — Artifact Forge UI
 - `/encounter-builder/docs` — How the Encounter Builder works
 - `/artifact-forge/docs` — How the Artifact Forge works

## Monster CR Scaler documentation (2014)

Detailed, transparent description of the scaler’s workflow and equations is available at:

- In‑app: http://localhost:3000/monster-scaler/docs
- Code: `src/app/utils/scaler.ts` (core), `src/app/data/constants.ts` (CR matrix)

## Combat Balancer documentation

Learn how encounter budgets, multipliers, and suggestions are computed:

- In‑app: http://localhost:3000/encounter-builder/docs
- Code: `src/app/utils/encounter.ts`

## Magic Item Creator documentation

Read about rarity by level and suggested bonus curves:

- In‑app: http://localhost:3000/artifact-forge/docs
- Code: `src/app/utils/items.ts`

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Netlify

This project is configured to deploy on Netlify using the official Next.js adapter.

Steps:

1. Ensure your site uses Node 22 on Netlify (set automatically by `netlify.toml`).
2. The plugin `@netlify/plugin-nextjs` is installed as a dev dependency and enabled in `netlify.toml`.
3. Build command: `npm run build`
4. Publish directory: `.next`

Notes:

- React Compiler is disabled by default on Netlify (`REACT_COMPILER=false` in `netlify.toml`). If you want it, set an environment variable `REACT_COMPILER=true` in Netlify and confirm compatibility.
- No custom Netlify Functions folder is needed; the plugin handles server functions generation and upload.

## Versions and requirements

- Next.js: pinned to the latest stable (currently resolved to 16.0.8)
- React / React DOM: 19.2.0
- TypeScript / ESLint / eslint-config-next: latest compatible
- Node runtime: >=20 and <=22.x (Netlify set to 22)

If you update dependencies, run:

```
npm install
npm run build
npm test
```
