import {Metadata, Viewport} from "next";
import Link from "next/link";

import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";
import { WhyDifferent } from "@/app/components/atoms/WhyDifferent";
import {Locale} from "@/i18n/config";

export const metadata: Metadata = {
    title: "CRealizr D&D Toolkit | Encounters, Scaling, Items",
    description: "DM-first D&D toolkit to build encounters, scale monsters, and forge magic items with export-ready outputs and 2014/2024 support.",
    keywords: [
      "D&D encounter builder",
      "monster scaler",
      "5e encounter balance",
      "DM tools",
      "D&D 2014 rules",
      "D&D 2024 rules",
      "magic item generator",
      "statblock export",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "CRealizr D&D Toolkit | Encounters, Scaling, Items",
      description: "DM-first D&D toolkit to build encounters, scale monsters, and forge magic items with export-ready outputs and 2014/2024 support.",
      url: "/",
      type: "website",
      images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr D&D toolkit preview" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CRealizr D&D Toolkit | Encounters, Scaling, Items",
      description: "DM-first D&D toolkit to build encounters, scale monsters, and forge magic items with export-ready outputs and 2014/2024 support.",
      images: ["/og-default.svg"],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default async function Home({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      {/* Hero Section */}
      <section className="relative glass-panel p-8 sm:p-24 flex flex-col items-center text-center overflow-hidden min-h-[60vh] justify-center fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background:"radial-gradient(circle, rgba(197,160,89,0.3), transparent 70%)"}} />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background:"radial-gradient(circle, rgba(44,62,80,0.4), transparent 70%)"}} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-serif tracking-tight text-foreground drop-shadow-sm">
            Run balanced adventures faster, without breaking the fantasy.
          </h1>
          <p className="mt-6 text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            A table-ready D&amp;D toolkit for Dungeon Masters. Build encounters, scale monsters, and forge artifacts with
            outputs you can use immediately. Toggle 2014 or 2024 to swap the math underneath without changing your workflow.
          </p>
          <WhyDifferent className="mt-6" />
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/encounter-builder`}>
              <Button variant="primary" className="px-10 py-4 text-base sm:text-lg uppercase font-serif tracking-widest">
                Build an Encounter
              </Button>
            </Link>
            <Link href={`/${locale}/monster-scaler`}>
              <Button className="px-10 py-4 text-base sm:text-lg uppercase font-serif tracking-widest">
                Scale a Monster
              </Button>
            </Link>
            <Link href={`/${locale}/artifact-forge`}>
              <Button className="px-10 py-4 text-base sm:text-lg uppercase font-serif tracking-widest">
                Forge an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-serif accent-gold uppercase tracking-widest">Example Encounter Output</h2>
          <p className="text-muted mt-3 max-w-2xl text-base italic">
            A concrete result, ready to run at the table. The tool surfaces a recommended mix and its budget fit.
          </p>
        </div>
        <Card className="p-8 border-gold/10 bg-card">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-center">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Inputs</div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Party</span><span className="font-medium">4 PCs · Level 5</span></div>
                <div className="flex justify-between"><span className="text-muted">Difficulty</span><span className="font-medium">Hard</span></div>
                <div className="flex justify-between"><span className="text-muted">Ruleset</span><span className="font-medium">2014 or 2024</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Recommended Mix</div>
              <div className="p-4 border border-gold/20 bg-gold/5 rounded-sm">
                <div className="text-lg font-serif accent-gold">1 × CR 5, 2 × CR 2</div>
                <div className="text-xs text-muted mt-1">Budget Fit: 96% (on target)</div>
              </div>
              <div className="text-xs text-muted">
                Budget Fit = adjusted XP / target XP. Example: 1,920 vs 2,000 XP → 96%.
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-serif accent-gold uppercase tracking-widest">Sample Outputs</h2>
          <p className="text-muted mt-3 max-w-2xl text-base italic">
            Each tool produces a clear, table-ready result. Exports match the preview.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Encounter Builder</div>
            <div className="mt-3 text-lg font-serif accent-gold">2 × CR 3, 1 × CR 1</div>
            <div className="text-xs text-muted mt-1">Budget Fit: 92% · Hard</div>
            <div className="mt-4 text-xs text-muted">2014/2024 toggle adjusts thresholds and XP.</div>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Monster Scaler</div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">AC</span><span className="font-medium">13 → 16</span></div>
              <div className="flex justify-between"><span className="text-muted">HP</span><span className="font-medium">90 → 180</span></div>
              <div className="flex justify-between"><span className="text-muted">DPR</span><span className="font-medium">12 → 26</span></div>
            </div>
            <div className="mt-4 text-xs text-muted">Preview matches PNG/PDF export.</div>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Artifact Forge</div>
            <div className="mt-3 text-lg font-serif accent-gold">Aegis of the Dawn</div>
            <div className="text-xs text-muted mt-1">Rare · +2 AC · Attunement</div>
            <div className="mt-3 text-xs text-muted italic">&quot;Forged at sunrise to turn the restless dead.&quot;</div>
          </Card>
        </div>
      </section>

      <section className="grid gap-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-serif accent-gold uppercase tracking-widest">How It Works</h2>
          <p className="text-muted mt-3 max-w-xl text-base italic">Three steps, built for live prep or mid-session pivots.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Step 1</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">Choose a Tool</h3>
            <p className="text-muted mt-2 text-sm">Encounter builder, monster scaler, or item forge.</p>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Step 2</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">Set Your Inputs</h3>
            <p className="text-muted mt-2 text-sm">Party size, difficulty, CR targets, and flavor details.</p>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">Step 3</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">Run or Export</h3>
            <p className="text-muted mt-2 text-sm">Copy the output or export PNG/PDF statblocks.</p>
          </Card>
        </div>
      </section>

      {/* Services/Tools Section */}
      <section className="grid gap-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-serif accent-gold uppercase tracking-widest">Core Toolkit</h2>
          <p className="text-muted mt-4 max-w-lg text-lg italic">Concrete outputs for encounter building, scaling, and item design.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <Link href={`/${locale}/monster-scaler`} className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-bg">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">Monster Scaler</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Adjust HP, AC, DPR, and suggested combat targets to a new CR. Includes export-ready statblocks.
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Scale a Monster <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href={`/${locale}/encounter-builder`} className="group">
            <Card className="p-10 border-silver/10 hover:border-silver/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-silver/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-silver transition-all shadow-glow bg-bg">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-silver transition-colors uppercase tracking-tight text-foreground">Encounter Builder</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Builds encounter budgets and enemy mixes from party size, level, and difficulty target.
              </p>
              <div className="mt-8 text-silver text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Build an Encounter <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href={`/${locale}/artifact-forge`} className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-bg">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">Artifact Forge</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Craft items with tuned bonuses, materials, and lore. Separates mechanical output from flavor text.
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Forge an Item <span>&rarr;</span>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Brief about services / why us */}
      <Card className="p-12 bg-card fantasy-border">
        <div className="grid gap-16 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-8 accent-gold uppercase tracking-tight">Reliability First</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">I</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">Ruleset Coverage</h4>
                  <p className="text-muted text-base mt-2">2014 + 2024 guidance is supported so your encounter math stays consistent across editions.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">II</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">Export Ready</h4>
                  <p className="text-muted text-base mt-2">Download PNG for VTT use or PDF for printouts. Filenames keep sessions organized.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">III</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">No Login Required</h4>
                  <p className="text-muted text-base mt-2">Built for live sessions: fast inputs, readable outputs, and no account gate.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded border border-gold/20 bg-background/60 flex items-center justify-center overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-accent-blue/10" />
             <span className="text-gold/40 font-serif italic text-sm tracking-widest uppercase">Manuscript Preview: Scaled Monster</span>
             {/* Abstract UI representation */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/4 border border-gold/30 rounded-sm bg-card shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-3">
                <div className="h-5 w-2/3 bg-gold/20 rounded-sm border-b border-gold/30" />
                <div className="h-2 w-full bg-foreground/5 rounded-full" />
                <div className="h-2 w-full bg-foreground/5 rounded-full" />
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="h-12 border border-gold/10 bg-gold/5 rounded-sm" />
                  <div className="h-12 border border-gold/10 bg-gold/5 rounded-sm" />
                  <div className="h-12 border border-gold/10 bg-gold/5 rounded-sm" />
                </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
