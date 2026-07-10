# CRealizr

CRealizr is a DM-first Dungeons & Dragons toolkit focused on fast, table-ready outputs. It's a Next.js 16 (App Router) app supporting both the 2014 and 2024 5e SRD rule sets, installable as a PWA, and localized into 6 languages.

## What it includes

- **Encounter Builder** — build balanced encounters, with a hex-map layout tool
- **Monster Scaler** — rescale a monster's HP, AC, DPR, and target CR
- **Travel Encounters** — random travel encounter generator
- **Artifact Forge** — craft magic items with balanced mechanical bonuses
- **My Bestiary** — save and manage custom monsters locally in the browser
- **Contact page** — SMTP-backed contact form with Turnstile spam protection
- Legal pages — Terms of Use, Privacy Policy, Disclaimer

Each of the four main tools has a companion `/docs` page documenting its methodology.

## Tech stack

- **Next.js 16** (App Router, Turbopack) with **React 19** and the React Compiler
- **TypeScript**, **Tailwind CSS 4**
- **next-intl** for i18n — 6 locales: `en`, `el`, `ru`, `de`, `fr`, `it` (locale prefix always present, e.g. `/en/...`)
- **Framer Motion** for animations, **Konva** for the encounter hex-map canvas
- **Serwist** (`@serwist/turbopack`) for the PWA service worker — offline fallback, install prompt, Google Consent Mode v2-aware Google Tag Manager
- **Vitest** for unit tests, **Playwright** for e2e tests
- **Nodemailer** for the contact form, gated by Cloudflare Turnstile

## Getting started

```bash
npm install
npm run dev          # start the dev server
```

Requires Node `>=20 <=22.x`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npx vitest run tests/encounter.test.ts` | Run a single test file |
| `npm run test:e2e` | Run e2e tests (Playwright, expects a dev server at `localhost:3000`) |
| `npm run release` / `release:dry` | Version bump based on commit message conventions (see `scripts/release.js`) |

## Environment variables

The contact form and site metadata read from these at runtime (see `src/app/lib/startupEnvCheck.ts` for the startup check):

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Outbound mail transport for the contact form |
| `MAIL_FROM`, `MAIL_TO` | Contact form sender/recipient addresses |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile spam protection on the contact form |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in SEO/JSON-LD metadata |
| `STRICT_ENV_CHECK` | If set, fails startup instead of warning when required vars are missing |

## Key routes

All routes are locale-prefixed (e.g. `/en/encounter-builder`); `/` redirects to the default locale.

- `/` — Home
- `/encounter-builder` — Encounter Builder UI
- `/encounter-builder/docs` — Encounter Builder methodology
- `/monster-scaler` — Monster Scaler UI
- `/monster-scaler/docs` — Monster Scaler methodology
- `/travel-encounters` — Travel Encounter Generator UI
- `/artifact-forge` — Artifact Forge UI
- `/artifact-forge/docs` — Artifact Forge methodology
- `/my-monsters` — My Bestiary (locally saved custom monsters)
- `/my-monsters/docs` — My Bestiary methodology
- `/contact` — Contact page
- `/terms`, `/privacy`, `/disclaimer` — Legal pages

## Project structure

- `src/app/[locale]/` — pages (App Router, locale-prefixed)
- `src/app/components/{atoms,molecules,organisms}/` — components, atomic design
- `src/app/context/` — React context providers (theme, sidebar, cookie consent, custom monsters, etc.)
- `src/app/utils/` — pure core logic (encounter, scaler, items, travel encounter), tested in `tests/`
- `src/app/data/` — game data for 2014 and 2024 rule sets
- `src/app/types/` — monster schemas, scaler types
- `src/engine/encounter/` — hex-map layout engine
- `src/messages/{locale}.json` — translations
- `src/app/sw.ts` — service worker source (compiled on demand via `src/app/sw.js/[[...path]]/route.ts`)
- `e2e/` — Playwright e2e tests

## Notes

- Validated against the 2014 and 2024 5e SRD. Not affiliated with Wizards of the Coast.
