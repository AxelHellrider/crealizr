import type { Metadata } from "next";

const title = "Monster Scaler for D&D 5e | CRealizr";
const description =
  "Scale any monster to a new CR with before/after stats, DPR, and export-ready statblocks. Supports 2014/2024 guidance.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "monster scaler",
    "CR scaling",
    "D&D 5e",
    "statblock export",
    "2014 rules",
    "2024 rules",
  ],
  alternates: {
    canonical: "/monster-scaler",
  },
  openGraph: {
    title,
    description,
    url: "/monster-scaler",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-monster-scaler.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr monster scaler preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-monster-scaler.svg"],
  },
};

export default function MonsterScalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
