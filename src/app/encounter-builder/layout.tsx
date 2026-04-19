import type { Metadata } from "next";

const title = "Encounter Builder for D&D 5e | CRealizr";
const description =
  "Build balanced D&D encounters fast with Budget Fit guidance, party inputs, and 2014/2024 rules support.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "encounter builder",
    "D&D 5e combat balance",
    "XP budget",
    "2014 rules",
    "2024 rules",
  ],
  alternates: {
    canonical: "/encounter-builder",
  },
  openGraph: {
    title,
    description,
    url: "/encounter-builder",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-encounter-builder.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr encounter builder preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-encounter-builder.svg"],
  },
};

export default function EncounterBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
