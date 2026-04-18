export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Artifact Forge | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/artifact-forge`} />
      <meta
        name="description"
        content="Forge balanced magic items with clear mechanics, crafting requirements, and lore. Export-ready previews included."
      />
      <meta
        name="keywords"
        content="magic item generator, artifact forge, D&D 5e items, crafting requirements, item balance"
      />
      <meta property="og:title" content="Artifact Forge | CRealizr" />
      <meta
        property="og:description"
        content="Forge balanced magic items with clear mechanics, crafting requirements, and lore."
      />
      <meta property="og:image" content={`${baseUrl}/og-artifact-forge.svg`} />
    </>
  );
}
