import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "D&D Travel Encounter Generator by Terrain | CRealizr";
const description =
    "Generate D&D 5e travel encounters by terrain type — forest, desert, mountain, ocean, and more. Quick rolls with optional difficulty checks for hexcrawl and overland travel.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "D&D travel encounters",
            "random encounter generator 5e",
            "terrain encounter tables",
            "hexcrawl encounters",
            "overland travel D&D",
            "wilderness encounter generator",
            "5e travel",
        ],
        alternates: buildAlternates(locale, "/travel-encounters"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/travel-encounters"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-travel-encounters.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr travel encounter generator",
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
}

export default function TravelEncountersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
