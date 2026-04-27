import type { Metadata } from "next";

const title = "Magic Item & Artifact Forge | CRealizr";
const description =
  "Forge balanced magic items with mechanics, crafting requirements, and lore. Generate export-ready previews.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "magic item generator",
    "artifact forge",
    "D&D 5e items",
    "crafting requirements",
    "item balance",
  ],
  alternates: {
    canonical: "/artifact-forge",
  },
  openGraph: {
    title,
    description,
    url: "/artifact-forge",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-artifact-forge.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr artifact forge preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-artifact-forge.svg"],
  },
};

export default function ArtifactForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
