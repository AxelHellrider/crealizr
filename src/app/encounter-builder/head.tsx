export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Encounter Builder | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/encounter-builder`} />
      <meta
        name="description"
        content="Build balanced encounters fast with Budget Fit guidance, 2014/2024 rules support, and clear output previews."
      />
      <meta
        name="keywords"
        content="encounter builder, combat balance, XP budget, D&D 5e, 2014 rules, 2024 rules"
      />
      <meta property="og:title" content="Encounter Builder | CRealizr" />
      <meta
        property="og:description"
        content="Build balanced encounters fast with Budget Fit guidance and clear output previews."
      />
      <meta property="og:image" content={`${baseUrl}/og-encounter-builder.svg`} />
    </>
  );
}
