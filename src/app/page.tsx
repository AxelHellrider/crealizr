import {Metadata, Viewport} from "next";
import Link from "next/link";

import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";

export const metadata: Metadata = {
    title: "CRealizr | Dungeons & Dragons Toolkit",
    description: "For a better TTRPG experience",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function Home() {
  return (
    <div className="flex flex-col gap-20 -mt-4">
      {/* Hero Section */}
      <section className="relative glass-panel p-10 sm:p-24 flex flex-col items-center text-center overflow-hidden min-h-[70vh] justify-center fantasy-border">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background:"radial-gradient(circle, rgba(197,160,89,0.3), transparent 70%)"}} />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background:"radial-gradient(circle, rgba(44,62,80,0.4), transparent 70%)"}} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl sm:text-8xl font-serif tracking-tight text-foreground drop-shadow-sm">
            BUILD BETTER <br /> <span className="accent-gold uppercase italic">Encounters</span>
          </h1>
          <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Precise tabletop utilities for Dungeons & Dragons. 
            Reliable monster scaling, combat balancing, and artifact generation based on 2014 &amp; 2024 rulesets.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link href="/scale">
              <Button variant="primary" className="px-10 py-4 text-xl uppercase font-serif tracking-widest">
                SCALE MONSTERS
              </Button>
            </Link>
            <Link href="/balance">
              <Button className="px-10 py-4 text-xl uppercase font-serif tracking-widest">
                BALANCE COMBAT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services/Tools Section */}
      <section className="grid gap-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-serif accent-gold uppercase tracking-widest">Core Toolkit</h2>
          <p className="text-muted mt-4 max-w-lg text-lg italic">Mathematical precision for every session.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <Link href="/scale" className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-bg">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">Monster Scaler</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Mathematically accurate CR adjustment. Recalculates HP, AC, and DPR targets across both rulesets instantly.
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Open Scaler <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href="/balance" className="group">
            <Card className="p-10 border-silver/10 hover:border-silver/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-silver/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-silver transition-all shadow-glow bg-bg">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-silver transition-colors uppercase tracking-tight text-foreground">Combat Balancer</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Calculates XP budgets and suggested formations based on encounter difficulty and party composition.
              </p>
              <div className="mt-8 text-silver text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Check Balance <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href="/items" className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-bg">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">Artifact Forge</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                Generate magic items with balanced mechanical bonuses (To Hit, AC, Save DC) appropriate for player level.
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                Create Item <span>&rarr;</span>
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
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">Ruleset Parity</h4>
                  <p className="text-muted text-base mt-2">Tools are cross-referenced with both 2014 and 2024 core rules for consistent results.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">II</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">Instant Export</h4>
                  <p className="text-muted text-base mt-2">Generate high-fidelity PNG or PDF statblocks directly for immediate use at the table.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">III</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">Clean Utility</h4>
                  <p className="text-muted text-base mt-2">Designed for high-speed use during live sessions with zero account or login requirements.</p>
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
