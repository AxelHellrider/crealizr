import Image from "next/image";
import {Metadata, Viewport} from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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
      <section className="w-full h-full flex-1 flex flex-col items-center justify-center text-center px-6 py-20 text-white relative overflow-hidden">
          {/* arcane tech glow */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
              <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Where Arcana Meets Algorithm
          </h1>

          <p className="mt-6 max-w-xl text-lg text-zinc-400">
              Upscale, downscale, and re-forge any monster for any party.
              Built on the 2014 and 2024 DMG rulesets—plus fully custom formulae.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                  href="/scale"
                  className="px-8 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 transition font-semibold"
              >
                  Start Scaling
              </a>
              <a
                  href="/monsters"
                  className="px-8 py-3 rounded-lg border border-zinc-600 hover:bg-zinc-800 transition font-semibold"
              >
                  Browse Monsters
              </a>
          </div>
      </section>
  );
}
