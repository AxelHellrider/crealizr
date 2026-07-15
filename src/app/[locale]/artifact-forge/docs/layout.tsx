import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "Artifact Forge – Item Rarity & Balance Docs | CRealizr";
const description =
    "How the CRealizr Artifact Forge works: rarity bands, mechanical bonus guidelines, crafting requirements, and export-ready card format for D&D 5e magic items.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "D&D magic item rarity",
            "artifact forge docs",
            "5e item balance guide",
            "magic item crafting D&D",
            "homebrew item rules",
        ],
        alternates: buildAlternates(locale, "/artifact-forge/docs"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/artifact-forge/docs"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-artifact-forge-docs.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr artifact forge documentation",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-artifact-forge-docs.svg"],
        },
    };
}

export default function ArtifactForgeDocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
