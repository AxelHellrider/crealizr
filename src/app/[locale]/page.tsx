import {Metadata} from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buildHreflang } from "@/app/lib/seo";

import { Button } from "@/app/components/atoms/Button";
import { StatScalePreview } from "@/app/components/molecules/StatScalePreview";
import { ItemShowcaseCard } from "@/app/components/molecules/ItemShowcaseCard";
import { IconMonsterScaler, IconEncounterBuilder, IconArtifactForge, IconTravelEncounters, IconMyBestiary, IconQuill } from "@/app/components/atoms/ToolIcons";
import CrealizrMark from "@/app/components/atoms/CrealizrMark";
import { HeroCarousel, type HeroSlide } from "@/app/components/organisms/HeroCarousel";
import { Card } from "@/app/components/atoms/Card";
import { buildEncounterSuggestions } from "@/engine/encounter";
import { MONSTER_MANUAL_2014_CATALOG } from "@/app/data/monsters";
import { scaleMonster } from "@/app/services/scalerService";
import { buildItemBlueprint } from "@/app/services/itemService";
import { getTravelEncounter } from "@/app/utils/travelEncounter";
import { formatCR } from "@/app/lib/format";
import type { MonsterBase } from "@/app/types/monster";

// Fixed sample input — a level 1/4 CR Goblin, scaled up to CR 10 to demonstrate the jump.
const SAMPLE_GOBLIN: MonsterBase = {
    name: "Goblin",
    edition: "2014",
    size: "Small",
    type: "humanoid",
    dpr: { min: 5, max: 5, range: "5" },
    alignment: "Neutral Evil",
    cr: 0.25,
    terrain: ["any"],
    affiliation: "humanoid",
    xp: 50,
    stats: { ac: 15, hp: 7, str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, speed: "30 ft" },
    raw_source_ref: "",
};

// Fixed sample homebrew entry — a made-up creature, standing in for what a real My Bestiary entry looks like.
const SAMPLE_HOMEBREW: MonsterBase = {
    name: "Sun-Warped Treant",
    edition: "2014",
    size: "Large",
    type: "plant",
    dpr: { min: 18, max: 24, range: "18–24" },
    alignment: "Neutral",
    cr: 6,
    terrain: ["wilderness"],
    affiliation: "plant",
    xp: 2300,
    stats: { ac: 16, hp: 84, str: 19, dex: 8, con: 17, int: 8, wis: 12, cha: 9, speed: "20 ft" },
    raw_source_ref: "",
};

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

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations();

  // Ordered as a narrative: welcome the visitor, introduce who built this, then the tools themselves.
  const heroSlides: HeroSlide[] = [
    {
      accent: "gold",
      kicker: t("home.hero.welcome"),
      title: t("home.hero.title"),
      description: t("home.hero.welcomeBlurb"),
      icon: <CrealizrMark className="w-full h-full" />,
    },
    {
      accent: "silver",
      kicker: t("home.hero.about"),
      title: t("footer.tagline"),
      description: t("home.hero.aboutBlurb"),
      icon: <IconQuill className="w-full h-full" />,
      preview: (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-silver/60 font-bold text-center">
            {t("home.reliability.point3.title")}
          </span>
          <span className="text-silver/30" aria-hidden="true">|</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-silver/60 font-bold text-center">
            {t("home.hero.rulesetNote")}
          </span>
        </div>
      ),
    },
    {
      href: `/${locale}/encounter-builder`,
      accent: "silver",
      kicker: t("home.hero.tool"),
      title: t("home.coreToolkit.encounterBuilder.title"),
      description: t("home.coreToolkit.encounterBuilder.description"),
      action: t("home.coreToolkit.encounterBuilder.action"),
      icon: <IconEncounterBuilder className="w-full h-full" />,
    },
    {
      href: `/${locale}/monster-scaler`,
      accent: "gold",
      kicker: t("home.hero.tool"),
      title: t("home.coreToolkit.monsterScaler.title"),
      description: t("home.coreToolkit.monsterScaler.description"),
      action: t("home.coreToolkit.monsterScaler.action"),
      icon: <IconMonsterScaler className="w-full h-full" />,
      preview: <StatScalePreview className="w-full max-w-64" />,
    },
    {
      href: `/${locale}/artifact-forge`,
      accent: "gold",
      kicker: t("home.hero.tool"),
      title: t("home.coreToolkit.artifactForge.title"),
      description: t("home.coreToolkit.artifactForge.description"),
      action: t("home.coreToolkit.artifactForge.action"),
      icon: <IconArtifactForge className="w-full h-full" />,
      preview: <ItemShowcaseCard className="w-full max-w-64" />,
    },
    {
      href: `/${locale}/travel-encounters`,
      accent: "silver",
      kicker: t("home.hero.tool"),
      title: t("travelEncounters.title"),
      description: t("travelEncounters.description"),
      action: t("home.hero.travelAction"),
      icon: <IconTravelEncounters className="w-full h-full" />,
    },
    {
      href: `/${locale}/my-monsters`,
      accent: "gold",
      kicker: t("home.hero.tool"),
      title: t("myMonsters.title"),
      description: t("myMonsters.description"),
      action: t("home.hero.bestiaryAction"),
      icon: <IconMyBestiary className="w-full h-full" />,
    },
  ];

  // ── Real engine output for the "See It In Action" showcase ────────────────
  const encounterResult = buildEncounterSuggestions(
      {
          level: 5, size: 4, difficulty: "hard", ruleset: "2014",
          budgetMode: "encounter", mode: "group", includeMinions: false,
          groupTypes: 2, relationCriteria: "any", useXP: true,
      },
      MONSTER_MANUAL_2014_CATALOG,
  );
  const encounterSample = encounterResult.groupSuggestions[0];

  const scaledGoblin = scaleMonster(SAMPLE_GOBLIN, 10);
  const goblinDprBefore = Math.round((SAMPLE_GOBLIN.dpr.min + SAMPLE_GOBLIN.dpr.max) / 2);
  const goblinDprAfter = Math.round((scaledGoblin.dpr.min + scaledGoblin.dpr.max) / 2);

  const itemSample = buildItemBlueprint({
      name: "Flameheart Blade",
      type: "Weapon",
      attunement: true,
      level: 8,
      targets: [],
  });

  const travelSample = getTravelEncounter("Forest", 250, "combat");

  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {/* Hero Section — the banners themselves are the hero, auto-rotating indefinitely */}
      <section className="relative glass-panel fantasy-border lg:border-x-0 lg:border-t-0">
        <h1 className="sr-only">{t("home.hero.title")}</h1>
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* Live Showcase — real output from the actual tools, not mockups */}
      <section className="grid gap-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl lg:text-4xl font-serif accent-gold uppercase tracking-widest">{t("home.showcase.title")}</h2>
          <p className="text-muted mt-3 max-w-xl text-base italic">{t("home.showcase.description")}</p>
        </div>

        {/* Encounter Builder */}
        <Card className="p-8 border-silver/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-silver/70 font-bold">{t("home.coreToolkit.encounterBuilder.title")}</div>
              <p className="text-muted mt-2 text-sm">{t("home.showcase.encounterInputs")}</p>
            </div>
            {encounterSample ? (
              <div className="p-5 border border-silver/20 bg-silver/5">
                <div className="text-xs uppercase tracking-[0.2em] text-silver/70 font-bold">{t("encounterBuilder.recommendedMix")}</div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                  {encounterSample.members.map((m, i) => (
                    <span key={i}>
                      <span className="font-bold text-lg accent-gold">{m.count}</span>
                      <span className="text-muted mx-1 font-sans italic text-sm">&times;</span>
                      <span className="text-foreground text-base">CR {formatCR(m.cr)}</span>
                      {i < encounterSample.members.length - 1 && <span className="text-gold/30 mx-2">|</span>}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted mt-2">
                  {t("encounterBuilder.totalXPBudget")}: {encounterResult.budget.toLocaleString()} XP · {(encounterSample.fit * 100).toFixed(0)}%
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm italic">{t("home.showcase.noSample")}</p>
            )}
          </div>
        </Card>

        {/* Monster Scaler */}
        <Card className="p-8 border-gold/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.coreToolkit.monsterScaler.title")}</div>
              <p className="text-muted mt-2 text-sm">{t("home.showcase.scalerInputs")}</p>
            </div>
            <StatScalePreview
                decorative={false}
                rows={[
                    { label: t("monsterScaler.ac"), before: SAMPLE_GOBLIN.stats.ac, after: scaledGoblin.stats.ac, max: Math.max(25, scaledGoblin.stats.ac * 1.15) },
                    { label: t("monsterScaler.hp"), before: SAMPLE_GOBLIN.stats.hp, after: scaledGoblin.stats.hp, max: Math.max(200, scaledGoblin.stats.hp * 1.15) },
                    { label: t("monsterScaler.dpr"), before: goblinDprBefore, after: goblinDprAfter, max: Math.max(30, goblinDprAfter * 1.15) },
                ]}
                className="p-5 border border-gold/20 bg-gold/5"
            />
          </div>
        </Card>

        {/* Artifact Forge */}
        <Card className="p-8 border-gold/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("home.coreToolkit.artifactForge.title")}</div>
              <p className="text-muted mt-2 text-sm">{t("home.showcase.itemInputs")}</p>
            </div>
            <ItemShowcaseCard
                decorative={false}
                name={itemSample.name}
                rarity={itemSample.rarity}
                flavor={t("home.showcase.itemFlavor")}
                className="p-5 border border-gold/20 bg-gold/5"
            />
          </div>
        </Card>

        {/* Travel Encounters */}
        <Card className="p-8 border-silver/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-silver/70 font-bold">{t("travelEncounters.title")}</div>
              <p className="text-muted mt-2 text-sm">{t("home.showcase.travelInputs")}</p>
            </div>
            {travelSample ? (
              <div className="p-5 border border-silver/20 bg-silver/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-silver/70 font-bold">{t("travelEncounters.combat")}</span>
                  <span className="text-[10px] text-muted">d500: {travelSample.range[0]}–{travelSample.range[1]}</span>
                </div>
                <p className="text-foreground text-sm mt-2 leading-relaxed">{travelSample.description}</p>
              </div>
            ) : (
              <p className="text-muted text-sm italic">{t("home.showcase.noSample")}</p>
            )}
          </div>
        </Card>

        {/* My Bestiary */}
        <Card className="p-8 border-gold/10 bg-card">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("myMonsters.title")}</div>
              <p className="text-muted mt-2 text-sm">{t("home.showcase.bestiaryInputs")}</p>
            </div>
            <div className="p-5 border border-gold/20 bg-gold/5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-serif accent-gold text-base leading-tight">{SAMPLE_HOMEBREW.name}</span>
                <span className="shrink-0 text-xs font-bold uppercase tracking-widest bg-gold/10 text-gold/70 px-2 py-1">
                  CR {formatCR(SAMPLE_HOMEBREW.cr)}
                </span>
              </div>
              <p className="text-xs text-muted capitalize mt-1">{SAMPLE_HOMEBREW.size} {SAMPLE_HOMEBREW.type}</p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 mt-3 pt-3 border-t border-gold/10 text-xs text-foreground/80">
                <span>{t("monsterScaler.ac")} {SAMPLE_HOMEBREW.stats.ac}</span>
                <span>{t("monsterScaler.hp")} {SAMPLE_HOMEBREW.stats.hp}</span>
                <span>{SAMPLE_HOMEBREW.stats.speed}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Contact CTA */}
      <section className="flex flex-col items-center text-center gap-5 border border-gold/15 bg-card/40 py-12 px-6">
        <h2 className="text-2xl lg:text-3xl font-serif accent-gold uppercase tracking-widest">{t("home.contactCta.title")}</h2>
        <p className="text-muted max-w-md text-sm">{t("home.contactCta.description")}</p>
        <Link href={`/${locale}/contact`} scroll={false}>
          <Button variant="primary" className="px-8 py-3 text-xs uppercase tracking-widest">
            {t("home.contactCta.action")}
          </Button>
        </Link>
      </section>

    </div>
  );
}
