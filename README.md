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

- `/scale` — Monster CR Scaler UI
- `/scale/docs` — How the CR Scaler works (formulas and methods)
- `/balance` — Combat Balancer UI
- `/items` — Magic Item Creator UI
 - `/balance/docs` — How the Combat Balancer works
 - `/items/docs` — How the Item Creator works

## Monster CR Scaler documentation (2014)

Detailed, transparent description of the scaler’s workflow and equations is available at:

- In‑app: http://localhost:3000/scale/docs
- Code: `src/app/utils/scaler.ts` (core), `src/app/data/constants.ts` (CR matrix)

## Combat Balancer documentation

Learn how encounter budgets, multipliers, and suggestions are computed:

- In‑app: http://localhost:3000/balance/docs
- Code: `src/app/utils/encounter.ts`

## Magic Item Creator documentation

Read about rarity by level and suggested bonus curves:

- In‑app: http://localhost:3000/items/docs
- Code: `src/app/utils/items.ts`

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
