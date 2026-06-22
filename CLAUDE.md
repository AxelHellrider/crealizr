# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRealizr is a D&D dungeon master toolkit built with Next.js 16, React 19, and TypeScript. It provides tools: Encounter Builder, Monster Scaler, Travel Encounters, and Artifact Forge.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — run all tests (vitest)
- `npx vitest run tests/encounter.test.ts` — run a single test file

## Architecture

- **Next.js App Router** with `next-intl` for i18n (6 locales: en, el, ru, de, fr, it). All pages live under `src/app/[locale]/`.
- **Locale prefix is always present** — root `/` redirects to `/en`. Middleware in `src/middleware.ts` handles routing.
- **Translations** in `src/messages/{locale}.json`.
- **Core logic** lives in `src/app/utils/` (encounter.ts, scaler.ts, items.ts, travelEncounter.ts) — these are pure functions, tested in `tests/`.
- **Game data** in `src/app/data/` (constants.ts for 5e 2014, constants2024.ts for 2024 rules).
- **Types** in `src/app/types/` (monster schemas, scaler types).
- **Components** follow atomic design: `src/app/components/{atoms,molecules,organisms}/`.
- **Context providers**: ThemeContext and SidebarContext in `src/app/context/`.
- **API route**: `src/app/api/contact/` (nodemailer-based contact form).
- **Path alias**: `@` maps to `src/`.

## Tech Stack

- Next.js 16 with React Compiler (babel-plugin-react-compiler)
- Tailwind CSS 4
- Framer Motion for animations
- Vitest for testing (node environment, tests in `tests/`)
- Node >=20 <=22.x required
