import type { Metadata } from "next";

const title = "Artifact Forge Docs & Rarity | CRealizr";
const description =
  "Artifact Forge documentation covering rarity bands, bonuses, and item blueprint output.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "artifact forge docs",
    "magic item generator",
    "rarity bands",
    "D&D item balance",
  ],
  alternates: {
    canonical: "/artifact-forge/docs",
  },
  openGraph: {
    title,
    description,
    url: "/artifact-forge/docs",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-artifact-forge-docs.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr artifact forge documentation preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-artifact-forge-docs.svg"],
  },
};

export default function ArtifactForgeDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
