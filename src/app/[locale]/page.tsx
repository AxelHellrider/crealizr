import {Metadata, Viewport} from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buildHreflang } from "@/app/lib/seo";

import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";

export const metadata: Metadata = {
    title: "CRealizr — Free D&D 5e DM Toolkit | Encounter Builder, Monster Scaler",
    description: "Free D&D 5e toolkit for dungeon masters. Build balanced encounters with a live hex battlefield, scale monsters by CR, generate travel encounters, and forge magic items. Supports 2014 and 2024 rulesets.",
    keywords: [
        "D&D encounter builder",
        "D&D encounter calculator",
        "monster CR scaler",
        "5e encounter balance tool",
        "dungeon master tools free",
        "D&D DM toolkit",
        "D&D 2014 rules",
        "D&D 2024 rules",
        "magic item generator 5e",
        "D&D encounter difficulty",
        "hex map D&D",
    ],
    alternates: {
        canonical: "/",
        languages: buildHreflang("/"),
    },
    openGraph: {
        title: "CRealizr — Free D&D 5e DM Toolkit",
        description: "Free D&D 5e toolkit for dungeon masters. Build balanced encounters with a live hex battlefield, scale monsters by CR, and forge magic items.",
        url: "/",
        type: "website",
        siteName: "CRealizr",
        images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr — free D&D 5e DM toolkit" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "CRealizr — Free D&D 5e DM Toolkit",
        description: "Free D&D 5e toolkit: encounter builder, monster scaler, travel encounters, and artifact forge. Supports 2014 and 2024 rules.",
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

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations();
  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {/* Hero Section */}
      <section className="relative glass-panel p-5 lg:p-24 flex flex-col items-center text-center min-h-[calc(100svh-3.5rem)] justify-center fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">
        <div className="pointer-events-none absolute inset-0 opacity-20 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full" style={{background:"radial-gradient(circle, rgba(197,160,89,0.3), transparent 70%)"}} />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full" style={{background:"radial-gradient(circle, rgba(44,62,80,0.4), transparent 70%)"}} />
        </div>

        <div className="relative z-10 max-w-4xl lg:max-w-5xl">
          <h1 className="text-xl leading-tight lg:text-5xl lg:leading-tight font-serif tracking-tight text-foreground drop-shadow-sm">
            {t("home.hero.title")}
          </h1>
          <p className="mt-6 text-sm lg:text-2xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-light">
            {t("home.hero.description")}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/encounter-builder`}>
              <Button variant="primary" className="px-10 py-4 text-base lg:text-lg uppercase font-serif tracking-widest">
                {t("home.hero.buildEncounter")}
              </Button>
            </Link>
            <Link href={`/${locale}/monster-scaler`}>
              <Button className="px-10 py-4 text-base lg:text-lg uppercase font-serif tracking-widest">
                {t("home.hero.scaleMonster")}
              </Button>
            </Link>
            <Link href={`/${locale}/artifact-forge`}>
              <Button className="px-10 py-4 text-base lg:text-lg uppercase font-serif tracking-widest">
                {t("home.hero.forgeItem")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl lg:text-4xl font-serif accent-gold uppercase tracking-widest">{t("home.howItWorks.title")}</h2>
          <p className="text-muted mt-3 max-w-xl text-base italic">{t("home.howItWorks.description")}</p>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.howItWorks.step1")}</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">{t("home.howItWorks.step1Title")}</h3>
            <p className="text-muted mt-2 text-sm">{t("home.howItWorks.step1Desc")}</p>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.howItWorks.step2")}</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">{t("home.howItWorks.step2Title")}</h3>
            <p className="text-muted mt-2 text-sm">{t("home.howItWorks.step2Desc")}</p>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.howItWorks.step3")}</div>
            <h3 className="mt-3 font-serif text-xl uppercase tracking-wide">{t("home.howItWorks.step3Title")}</h3>
            <p className="text-muted mt-2 text-sm">{t("home.howItWorks.step3Desc")}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl lg:text-4xl font-serif accent-gold uppercase tracking-widest">{t("home.exampleOutput.title")}</h2>
          <p className="text-muted mt-3 lg:max-w-2xl text-base italic">
            {t("home.exampleOutput.description")}
          </p>
        </div>
        <Card className="p-8 border-gold/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.exampleOutput.inputs")}</div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">{t("home.exampleOutput.party")}</span><span className="font-medium">{t("home.exampleOutput.partyValue")}</span></div>
                <div className="flex justify-between"><span className="text-muted">{t("home.exampleOutput.difficulty")}</span><span className="font-medium">{t("home.exampleOutput.difficultyValue")}</span></div>
                <div className="flex justify-between"><span className="text-muted">{t("home.exampleOutput.ruleset")}</span><span className="font-medium">{t("home.exampleOutput.rulesetValue")}</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.exampleOutput.recommendedMix")}</div>
              <div className="p-4 border border-gold/20 bg-gold/5 rounded-sm">
                <div className="text-lg font-serif accent-gold">1 × CR 5, 2 × CR 2</div>
                <div className="text-xs text-muted mt-1">{t("home.exampleOutput.budgetFit")}</div>
              </div>
              <div className="text-xs text-muted">
                {t("home.exampleOutput.budgetExplanation")}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl lg:text-4xl font-serif accent-gold uppercase tracking-widest">{t("home.sampleOutputs.title")}</h2>
          <p className="text-muted mt-3 max-w-2xl text-base italic">
            {t("home.sampleOutputs.description")}
          </p>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.sampleOutputs.encounterBuilder")}</div>
            <div className="mt-3 text-lg font-serif accent-gold">{t("home.sampleOutputs.encounterValue")}</div>
            <div className="text-xs text-muted mt-1">{t("home.sampleOutputs.encounterFit")}</div>
            <div className="mt-4 text-xs text-muted">{t("home.sampleOutputs.encounterNote")}</div>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.sampleOutputs.monsterScaler")}</div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">{t("home.sampleOutputs.ac")}</span><span className="font-medium">13 → 16</span></div>
              <div className="flex justify-between"><span className="text-muted">{t("home.sampleOutputs.hp")}</span><span className="font-medium">90 → 180</span></div>
              <div className="flex justify-between"><span className="text-muted">{t("home.sampleOutputs.dpr")}</span><span className="font-medium">12 → 26</span></div>
            </div>
            <div className="mt-4 text-xs text-muted">{t("home.sampleOutputs.scalerNote")}</div>
          </Card>
          <Card className="p-6 border-gold/10 bg-card">
            <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.sampleOutputs.artifactForge")}</div>
            <div className="mt-3 text-lg font-serif accent-gold">{t("home.sampleOutputs.itemName")}</div>
            <div className="text-xs text-muted mt-1">{t("home.sampleOutputs.itemDetails")}</div>
            <div className="mt-3 text-xs text-muted italic">{t("home.sampleOutputs.itemFlavor")}</div>
          </Card>
        </div>
      </section>

      {/* Services/Tools Section */}
      <section className="grid gap-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-serif accent-gold uppercase tracking-widest">{t("home.coreToolkit.title")}</h2>
          <p className="text-muted mt-4 max-w-lg text-lg italic">{t("home.coreToolkit.description")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <Link href={`/${locale}/monster-scaler`} className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-background text-gold">
                <svg fill="currentColor" height="20" width="20" viewBox="0 0 512 512"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M510.617,233.5l-64-144C444.055,83.727,438.32,80,432,80h-31.656c-0.044-0.001-0.084,0.001-0.128,0h-99.164 C298.35,72.423,293.86,65.77,288,60.484V32c0-17.672-14.328-32-32-32s-32,14.328-32,32v28.484 C218.14,65.77,213.65,72.423,210.948,80H111.81c-0.067,0.001-0.129-0.002-0.196,0H80c-6.32,0-12.055,3.727-14.617,9.5l-64,144 C0.44,235.619-0.002,237.822,0,240v16c0,4.89,1.12,9.796,3.375,14.313l16,32C24.797,313.148,35.883,320,48,320h96 c12.117,0,23.203-6.852,28.625-17.688l16-32C190.88,265.796,192,260.89,192,256v-16c0.002-2.178-0.44-4.381-1.383-6.5l-54-121.5 h74.332c2.702,7.577,7.191,14.231,13.051,19.516V418.75l-38.625,38.625c-9.156,9.148-11.891,22.914-6.938,34.867 C183.391,504.203,195.055,512,208,512h96c12.945,0,24.609-7.797,29.563-19.758c4.953-11.953,2.219-25.719-6.938-34.867L288,418.75 V131.516c5.859-5.284,10.35-11.938,13.052-19.516h74.331l-54,121.5c-0.942,2.119-1.385,4.322-1.383,6.5v16 c0,4.89,1.12,9.796,3.375,14.313l16,32C344.797,313.148,355.883,320,368,320h96c12.117,0,23.203-6.852,28.625-17.688l16-32 C510.88,265.796,512,260.89,512,256v-16C512.002,237.822,511.56,235.619,510.617,233.5z M151.383,224H40.618l49.78-112h11.207 L151.383,224z M256,112c-8.82,0-16-7.18-16-16s7.18-16,16-16c8.82,0,16,7.18,16,16S264.82,112,256,112z M360.617,224l49.777-112 h11.207l49.78,112H360.617z"></path> </g></svg>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">{t("home.coreToolkit.monsterScaler.title")}</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                {t("home.coreToolkit.monsterScaler.description")}
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                {t("home.coreToolkit.monsterScaler.action")} <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href={`/${locale}/encounter-builder`} className="group">
            <Card className="p-10 border-silver/10 hover:border-silver/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-silver/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-silver transition-all shadow-glow bg-background text-silver">
                <svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="currentColor" d="M19.75 14.438c59.538 112.29 142.51 202.35 232.28 292.718l3.626 3.75.063-.062c21.827 21.93 44.04 43.923 66.405 66.25-18.856 14.813-38.974 28.2-59.938 40.312l28.532 28.53 68.717-68.717c42.337 27.636 76.286 63.646 104.094 105.81l28.064-28.06c-42.47-27.493-79.74-60.206-106.03-103.876l68.936-68.938-28.53-28.53c-11.115 21.853-24.413 42.015-39.47 60.593-43.852-43.8-86.462-85.842-130.125-125.47-.224-.203-.432-.422-.656-.625C183.624 122.75 108.515 63.91 19.75 14.437zm471.875 0c-83.038 46.28-154.122 100.78-221.97 161.156l22.814 21.562 56.81-56.812 13.22 13.187-56.438 56.44 24.594 23.186c61.802-66.92 117.6-136.92 160.97-218.72zm-329.53 125.906l200.56 200.53c-4.36 4.443-8.84 8.793-13.405 13.032L148.875 153.53l13.22-13.186zm-76.69 113.28l-28.5 28.532 68.907 68.906c-26.29 43.673-63.53 76.414-106 103.907l28.063 28.06c27.807-42.164 61.758-78.174 104.094-105.81l68.718 68.717 28.53-28.53c-20.962-12.113-41.08-25.5-59.937-40.313 17.865-17.83 35.61-35.433 53.157-52.97l-24.843-25.655-55.47 55.467c-4.565-4.238-9.014-8.62-13.374-13.062l55.844-55.844-24.53-25.374c-18.28 17.856-36.602 36.06-55.158 54.594-15.068-18.587-28.38-38.758-39.5-60.625z"></path></g></svg>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-silver transition-colors uppercase tracking-tight text-foreground">{t("home.coreToolkit.encounterBuilder.title")}</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                {t("home.coreToolkit.encounterBuilder.description")}
              </p>
              <div className="mt-8 text-silver text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                {t("home.coreToolkit.encounterBuilder.action")} <span>&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href={`/${locale}/artifact-forge`} className="group">
            <Card className="p-10 border-gold/10 hover:border-gold/40 transition-all flex flex-col h-full bg-card">
              <div className="h-16 w-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-gold transition-all shadow-glow bg-background text-gold">
                <svg fill="currentColor" width="20" height="20" viewBox="0 0 503.607 503.607"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M298.472,250.946c-12.498-7.294-19.523-16.804-21.445-28.58c-1.318-8.142,0.101-16.325,2.644-23.695 c-20.069,14.395-44.653,39.886-44.653,78.311c0,23.141,18.827,41.967,41.967,41.967c23.141,0,41.967-18.826,41.967-41.967 C318.952,261.245,298.673,251.047,298.472,250.946z"></path> <path d="M276.984,142.689c-60.164,0-109.115,48.951-109.115,109.115s48.951,109.115,109.115,109.115 s109.115-48.951,109.115-109.115S337.148,142.689,276.984,142.689z M276.984,335.738c-32.399,0-58.754-26.355-58.754-58.754 c0-76.212,77.589-107.26,80.896-108.544c3.576-1.402,7.672-0.151,9.896,2.996c2.224,3.156,2.006,7.428-0.529,10.341 c-4.935,5.691-17.249,23.602-14.89,37.93c1.1,6.673,5.288,12.061,12.8,16.46c0.655,0.285,29.335,14.537,29.335,40.817 C335.738,309.382,309.382,335.738,276.984,335.738z"></path> <path d="M243.41,130.586V58.755h-17.307c-3.802,30.325-27.908,54.431-58.234,58.234v72.276 C184.194,160.895,211.204,139.517,243.41,130.586z"></path> <path d="M58.754,21.454v28.907h25.18c4.633,0,8.393,3.76,8.393,8.393s-3.76,8.393-8.393,8.393h-25.18v369.311h25.18 c4.633,0,8.393,3.76,8.393,8.393c0,4.633-3.76,8.393-8.393,8.393h-25.18v28.907c0,11.835,9.619,21.454,21.454,21.454h28.907V0 H80.208C68.373,0,58.754,9.619,58.754,21.454z"></path> <rect x="260.197" y="58.751" width="33.574" height="67.148"></rect> <path d="M423.399,0H125.902v503.607h297.497c11.835,0,21.454-9.619,21.454-21.454V21.454C444.852,9.619,435.234,0,423.399,0z M402.885,394.492c0,4.633-3.76,8.393-8.393,8.393c-27.774,0-50.361,22.587-50.361,50.361c0,4.633-3.76,8.393-8.393,8.393 h-33.574h-50.361h-33.574c-4.633,0-8.393-3.76-8.393-8.393c0-27.774-22.587-50.361-50.361-50.361 c-4.633,0-8.393-3.76-8.393-8.393V109.115c0-4.633,3.76-8.393,8.393-8.393c27.774,0,50.361-22.587,50.361-50.361 c0-4.633,3.76-8.393,8.393-8.393h33.574h50.361h33.574c4.633,0,8.393,3.76,8.393,8.393c0,27.774,22.587,50.361,50.361,50.361 c4.633,0,8.393,3.76,8.393,8.393V394.492z"></path> <path d="M310.557,373.021v71.831h17.307c3.802-30.326,27.908-54.432,58.234-58.234v-72.276 C369.773,342.712,342.763,364.09,310.557,373.021z"></path> <path d="M327.865,58.754h-17.307v71.831c32.206,8.931,59.216,30.309,75.541,58.679v-72.276 C355.773,113.186,331.667,89.08,327.865,58.754z"></path> <rect x="260.197" y="377.702" width="33.574" height="67.148"></rect> <path d="M167.869,314.342v72.276c30.326,3.802,54.431,27.908,58.234,58.234h17.307v-71.831 C211.204,364.09,184.194,342.712,167.869,314.342z"></path> </g> </g> </g> </g></svg>
              </div>
              <h3 className="font-serif text-2xl group-hover:text-gold transition-colors uppercase tracking-tight text-foreground">{t("home.coreToolkit.artifactForge.title")}</h3>
              <p className="text-muted mt-6 leading-relaxed flex-grow text-base">
                {t("home.coreToolkit.artifactForge.description")}
              </p>
              <div className="mt-8 text-gold text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                {t("home.coreToolkit.artifactForge.action")} <span>&rarr;</span>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Brief about services / why us */}
      <Card className="p-12 bg-card fantasy-border">
        <div className="grid gap-16 grid-cols-1 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-8 accent-gold uppercase tracking-tight">{t("home.reliability.title")}</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">I</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">{t("home.reliability.point1.title")}</h4>
                  <p className="text-muted text-base mt-2">{t("home.reliability.point1.description")}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">II</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">{t("home.reliability.point2.title")}</h4>
                  <p className="text-muted text-base mt-2">{t("home.reliability.point2.description")}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gold text-2xl font-serif">III</div>
                <div>
                  <h4 className="font-serif text-xl text-foreground uppercase tracking-wide">{t("home.reliability.point3.title")}</h4>
                  <p className="text-muted text-base mt-2">{t("home.reliability.point3.description")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded border border-gold/20 bg-background/60 flex items-center justify-center overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-accent-blue/10" />
             <span className="text-gold/40 font-serif italic text-sm tracking-widest uppercase">{t("home.reliability.preview")}</span>
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
