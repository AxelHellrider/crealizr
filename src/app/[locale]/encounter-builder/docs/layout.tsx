import type { Metadata } from "next";
import { buildHreflang } from "@/app/lib/seo";

const title = "Encounter Builder – How It Works | CRealizr";
const description =
    "Full reference for CRealizr's encounter builder: XP budget vs CR match mode, hex battlefield, keyboard shortcuts, AoE hazards, cover rules, and suggestion math.";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title,
        description,
        keywords: [
            "D&D encounter builder docs",
            "XP budget formula",
            "encounter multiplier",
            "CR match mode",
            "D&D 5e encounter math",
            "hex map encounter",
            "cover rules D&D",
        ],
        alternates: {
            canonical: "/encounter-builder/docs",
            languages: buildHreflang("/encounter-builder/docs"),
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
                    alt: "CRealizr encounter builder documentation",
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
}

export default function EncounterBuilderDocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
