import {Metadata, Viewport} from "next";
import Link from "next/link";

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
    <div className="flex flex-col gap-16 -mt-4">
      {/* Hero Section */}
      <section className="relative glass-panel p-10 sm:p-20 flex flex-col items-center text-center overflow-hidden min-h-[60vh] justify-center">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[100px]" style={{background:"radial-gradient(circle, rgba(255,153,0,0.4), transparent 70%)"}} />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-[100px]" style={{background:"radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)"}} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
            Forge Legendary <br /> <span className="text-orange-500">Encounters</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            CRealizr is the ultimate mobile-first toolkit for Dungeons & Dragons Game Masters. 
            Scale monsters, balance combats, and create magic items in seconds.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/scale" className="ui-button px-8 py-3 text-lg">
              Start Scaling
            </Link>
            <Link href="/balance" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-all">
              Balance Combat
            </Link>
          </div>
        </div>
      </section>

      {/* Services/Tools Section */}
      <section className="grid gap-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold">Our DM Arsenal</h2>
          <p className="text-zinc-400 mt-2 max-w-lg">Everything you need to keep the game flowing smoothly without getting bogged down by math.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/scale" className="neo-card p-8 border border-orange-400/20 hover:border-orange-400/40 hover:shadow-[0_0_30px_rgba(255,153,0,0.1)] transition-all group flex flex-col h-full">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="font-bold text-xl group-hover:text-orange-400 transition-colors">Monster CR Scaler</h3>
            <p className="text-zinc-400 mt-4 leading-relaxed flex-grow">
              Instantly adjust any creature's stats to a target Challenge Rating. Support for both 2014 and 2024 rulesets ensures your math is always spot-on.
            </p>
            <div className="mt-6 text-orange-400 text-sm font-semibold flex items-center gap-2">
              Scale now <span>→</span>
            </div>
          </Link>

          <Link href="/balance" className="neo-card p-8 border border-teal-400/20 hover:border-teal-400/40 hover:shadow-[0_0_30px_rgba(69,219,170,0.1)] transition-all group flex flex-col h-full">
            <div className="h-12 w-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">⚔️</span>
            </div>
            <h3 className="font-bold text-xl group-hover:text-teal-400 transition-colors">Combat Balancer</h3>
            <p className="text-zinc-400 mt-4 leading-relaxed flex-grow">
              Generate encounter suggestions tailored to your party's size and level. Use "Budget Fit" technology to ensure perfectly tuned difficulty.
            </p>
            <div className="mt-6 text-teal-400 text-sm font-semibold flex items-center gap-2">
              Balance now <span>→</span>
            </div>
          </Link>

          <Link href="/items" className="neo-card p-8 border border-purple-400/20 hover:border-purple-400/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all group flex flex-col h-full">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-bold text-xl group-hover:text-purple-400 transition-colors">Magic Item Creator</h3>
            <p className="text-zinc-400 mt-4 leading-relaxed flex-grow">
              Forge unique magic items with bonuses and abilities tuned for specific levels and target monster types. Professional-grade loot, simplified.
            </p>
            <div className="mt-6 text-purple-400 text-sm font-semibold flex items-center gap-2">
              Forge now <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Brief about services / why us */}
      <section className="neo-card p-10 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Designed for the Table</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-teal-400 text-xl font-bold">01</div>
                <div>
                  <h4 className="font-semibold text-zinc-200">Mobile-First Design</h4>
                  <p className="text-zinc-400 text-sm">Perfect for use on your phone or tablet right behind the DM screen.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-orange-400 text-xl font-bold">02</div>
                <div>
                  <h4 className="font-semibold text-zinc-200">Dual Edition Support</h4>
                  <p className="text-zinc-400 text-sm">Seamlessly switch between 2014 and 2024 rulesets with a single toggle.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-purple-400 text-xl font-bold">03</div>
                <div>
                  <h4 className="font-semibold text-zinc-200">Fast Export</h4>
                  <p className="text-zinc-400 text-sm">Download your scaled statblocks as high-quality images or PDFs for your notes.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl border border-zinc-800 bg-black/40 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-purple-500/10" />
             <span className="text-zinc-500 italic text-sm">Preview: Scaled Monster Statblock</span>
             {/* Abstract UI representation */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/4 border border-white/5 rounded-lg bg-zinc-900/80 shadow-2xl p-4 flex flex-col gap-2">
                <div className="h-4 w-2/3 bg-orange-400/20 rounded" />
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="h-10 bg-white/5 rounded" />
                  <div className="h-10 bg-white/5 rounded" />
                  <div className="h-10 bg-white/5 rounded" />
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
