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
      "Encounter builder, monster scaler, and artifact forge for D&D 5e with 2014/2024 rules support.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  });

  const data = [website, software];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
