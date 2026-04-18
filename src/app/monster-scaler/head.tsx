export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Monster Scaler | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/monster-scaler`} />
      <meta
        name="description"
        content="Scale monsters to a new CR with clear before/after previews and export-ready statblocks. Supports 2014 and 2024 guidance."
      />
      <meta
        name="keywords"
        content="monster scaler, CR scaling, D&D 5e, statblock export, 2014 rules, 2024 rules"
      />
      <meta property="og:title" content="Monster Scaler | CRealizr" />
      <meta
        property="og:description"
        content="Scale monsters to a new CR with clear before/after previews and export-ready statblocks."
      />
      <meta property="og:image" content={`${baseUrl}/og-monster-scaler.svg`} />
    </>
  );
}
