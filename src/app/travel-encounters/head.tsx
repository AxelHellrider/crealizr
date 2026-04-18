export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Travel Encounters | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/travel-encounters`} />
      <meta
        name="description"
        content="Generate travel encounters by terrain with quick roll results and optional encounter balancing."
      />
      <meta
        name="keywords"
        content="travel encounters, D&D random encounters, terrain tables, encounter generator"
      />
      <meta property="og:title" content="Travel Encounters | CRealizr" />
      <meta
        property="og:description"
        content="Generate travel encounters by terrain with quick roll results."
      />
      <meta property="og:image" content={`${baseUrl}/og-travel-encounters.svg`} />
    </>
  );
}
