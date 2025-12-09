import {Metadata, Viewport} from "next";

export const metadata: Metadata = {
    title: "CRializr | Dungeons & Dragons CR Tool",
    description: "Optimize your monster encounters",
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
    <section className="relative glass-panel p-8">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full" style={{background:"radial-gradient(circle, rgba(255,153,0,0.35), transparent 60%)"}} />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full" style={{background:"radial-gradient(circle, rgba(124,58,237,0.35), transparent 60%)"}} />
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Where Arcana Meets Algorithm</h1>
      <p className="mt-4 max-w-2xl text-zinc-400">
        Prepare sessions faster with a mobile-first toolkit: scale monsters, balance encounters, and forge magic items.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <a href="/scale" className="neo-card p-4 border border-orange-400/20 hover:border-orange-400/40 transition">
          <div className="font-semibold">Monster CR Scaler</div>
          <div className="text-sm text-zinc-300">Scale stats and DPR to a target CR.</div>
        </a>
        <a href="/balance" className="neo-card p-4 border border-teal-400/20 hover:border-teal-400/40 transition">
          <div className="font-semibold">Combat Balancer</div>
          <div className="text-sm text-zinc-300">Encounter suggestions by party and difficulty.</div>
        </a>
        <a href="/items" className="neo-card p-4 border border-purple-400/20 hover:border-purple-400/40 transition">
          <div className="font-semibold">Magic Item Creator</div>
          <div className="text-sm text-zinc-300">Forge level-tuned, balanced items.</div>
        </a>
      </div>
    </section>
  );
}
