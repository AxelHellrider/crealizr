import Script from "next/script";

type JsonLdItem = Record<string, unknown>;

function compact(obj: JsonLdItem) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export function SeoJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const website: JsonLdItem = compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CRealizr",
    url: baseUrl,
    description:
      "DM-first D&D toolkit to build encounters, scale monsters, and forge artifacts with export-ready outputs.",
    potentialAction: baseUrl
      ? {
          "@type": "SearchAction",
          target: `${baseUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        }
      : undefined,
  });

  const software: JsonLdItem = compact({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CRealizr",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    url: baseUrl,
    description:
      "Free D&D 5e toolkit for dungeon masters: build balanced encounters with a live hex battlefield, scale monsters by CR, generate travel encounters, and forge magic items. Supports 2014 and 2024 rulesets.",
    keywords: "D&D encounter builder, monster scaler, 5e DM tools, encounter calculator, CR scaling",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Encounter builder with XP budget and CR match modes",
      "Interactive hex battlefield with AoE hazards and cover rules",
      "Monster CR scaler with statblock export",
      "Travel encounter generator by terrain",
      "Magic item and artifact forge",
      "Custom homebrew monster library",
      "D&D 2014 and 2024 ruleset support",
    ],
  });

  const data = [website, software];

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e") }}
    />
  );
}
