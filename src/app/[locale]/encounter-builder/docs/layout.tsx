import type { Metadata } from "next";

const title = "Encounter Builder Docs & Math | CRealizr";
const description =
  "Encounter Builder documentation covering Budget Fit, XP thresholds, and encounter suggestion logic.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "encounter builder docs",
    "budget fit",
    "XP thresholds",
    "D&D 5e encounter math",
  ],
  alternates: {
    canonical: "/encounter-builder/docs",
  },
  openGraph: {
    title,
    description,
    url: "/encounter-builder/docs",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-encounter-builder-docs.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr encounter builder documentation preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-encounter-builder-docs.svg"],
  },
};

export default function EncounterBuilderDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
