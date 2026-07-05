import type { Metadata } from "next";
import { buildHreflang } from "@/app/lib/seo";

const title = "D&D Magic Item & Artifact Generator | CRealizr";
const description =
    "Forge balanced D&D 5e magic items and artifacts. Set rarity, mechanics, lore, and crafting requirements — then export a print-ready card.";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title,
        description,
        keywords: [
            "D&D magic item generator",
            "5e artifact generator",
            "magic item creator",
            "D&D item forge",
            "crafting requirements D&D",
            "magic item balance 5e",
            "homebrew item generator",
        ],
        alternates: {
            canonical: "/artifact-forge",
            languages: buildHreflang("/artifact-forge"),
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
                    alt: "CRealizr artifact forge – magic item preview card",
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
}

export default function ArtifactForgeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
