export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <>
      <title>Monster Scaler Docs | CRealizr</title>
      <link rel="canonical" href={`${baseUrl}/monster-scaler/docs`} />
      <meta
        name="description"
        content="Documentation for the Monster Scaler formulas, CR matrix usage, and scaling workflow."
      />
      <meta
        name="keywords"
        content="monster scaler docs, CR matrix, D&D 5e scaling, 2014 rules, 2024 rules"
      />
      <meta property="og:title" content="Monster Scaler Docs | CRealizr" />
      <meta
        property="og:description"
        content="Documentation for the Monster Scaler formulas, CR matrix usage, and scaling workflow."
      />
      <meta property="og:image" content={`${baseUrl}/og-monster-scaler-docs.svg`} />
    </>
  );
}
