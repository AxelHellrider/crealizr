import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "My Monsters – Field Reference | CRealizr";
const description =
    "Field reference for the CRealizr custom monster library: stat fields, terrain and affiliation tags, JSON import/export format, and integration with other tools.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "homebrew monster fields D&D",
            "custom monster creator docs",
            "D&D 5e monster JSON",
            "CRealizr monster reference",
            "homebrew statblock fields",
        ],
        alternates: buildAlternates(locale, "/my-monsters/docs"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/my-monsters/docs"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-my-monsters-docs.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr My Monsters field reference",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-my-monsters-docs.svg"],
        },
    };
}

export default function MyMonstersDocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
