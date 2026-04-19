import type { Metadata } from "next";

const title = "Travel Encounter Generator | CRealizr";
const description =
  "Generate D&D travel encounters by terrain with quick rolls, optional balance checks, and table-ready results.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "D&D travel encounters",
    "random encounter generator",
    "terrain tables",
    "hexcrawl encounters",
    "5e travel",
  ],
  alternates: {
    canonical: "/travel-encounters",
  },
  openGraph: {
    title,
    description,
    url: "/travel-encounters",
    type: "website",
    siteName: "CRealizr",
    images: [
      {
        url: "/og-travel-encounters.svg",
        width: 1200,
        height: 630,
        alt: "CRealizr travel encounter generator preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-travel-encounters.svg"],
  },
};

export default function TravelEncountersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
