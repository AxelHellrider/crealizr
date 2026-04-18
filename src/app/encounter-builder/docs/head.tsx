export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Encounter Builder Docs | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/encounter-builder/docs`} />
      <meta
        name="description"
        content="Documentation for Budget Fit, XP thresholds, and encounter suggestion logic."
      />
      <meta
        name="keywords"
        content="encounter builder docs, budget fit, XP thresholds, D&D 5e encounter math"
      />
      <meta property="og:title" content="Encounter Builder Docs | CRealizr" />
      <meta
        property="og:description"
        content="Documentation for Budget Fit, XP thresholds, and encounter suggestion logic."
      />
      <meta property="og:image" content={`${baseUrl}/og-encounter-builder-docs.svg`} />
    </>
  );
}
