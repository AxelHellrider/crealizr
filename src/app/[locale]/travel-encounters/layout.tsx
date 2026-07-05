import type { Metadata } from "next";
import { buildHreflang } from "@/app/lib/seo";

const title = "D&D Travel Encounter Generator by Terrain | CRealizr";
const description =
    "Generate D&D 5e travel encounters by terrain type — forest, desert, mountain, ocean, and more. Quick rolls with optional difficulty checks for hexcrawl and overland travel.";

export async function generateMetadata(): Promise<Metadata> {
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
        alternates: {
            canonical: "/travel-encounters",
            languages: buildHreflang("/travel-encounters"),
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
