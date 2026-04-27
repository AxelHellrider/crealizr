import type { Metadata } from "next";

const title = "Monster Scaler Docs & Formulas | CRealizr";
const description =
  "Monster Scaler documentation covering formulas, CR matrix usage, and step-by-step scaling workflow.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "monster scaler docs",
    "CR matrix",
    "D&D 5e scaling",
    "2014 rules",
    "2024 rules",
  ],
  alternates: {
    canonical: "/monster-scaler/docs",
  },
  openGraph: {
    title,
    description,
    url: "/monster-scaler/docs",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-monster-scaler-docs.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr monster scaler documentation preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-monster-scaler-docs.svg"],
  },
};

export default function MonsterScalerDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
