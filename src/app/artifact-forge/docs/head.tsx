export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Artifact Forge Docs | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/artifact-forge/docs`} />
      <meta
        name="description"
        content="Documentation for Artifact Forge rarity bands, bonuses, and item blueprint output."
      />
      <meta
        name="keywords"
        content="artifact forge docs, magic item generator, rarity bands, D&D item balance"
      />
      <meta property="og:title" content="Artifact Forge Docs | CRealizr" />
      <meta
        property="og:description"
        content="Documentation for Artifact Forge rarity bands, bonuses, and item blueprint output."
      />
      <meta property="og:image" content={`${baseUrl}/og-artifact-forge-docs.svg`} />
    </>
  );
}
