import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "My Monsters — Homebrew Monster Library | CRealizr";
const description =
    "Store, manage, and export your homebrew D&D 5e monsters. Build a custom library, import from JSON, and use your creatures across all CRealizr tools.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "homebrew monsters D&D",
            "custom monster library 5e",
            "D&D monster creator",
            "homebrew statblock manager",
            "import export D&D monsters",
            "custom monster D&D 5e",
        ],
        alternates: buildAlternates(locale, "/my-monsters"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/my-monsters"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-my-monsters.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr My Monsters – custom monster library",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-my-monsters.svg"],
        },
    };
}

export default function MyMonstersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
