import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "D&D Monster Scaler — Resize Any Creature by CR | CRealizr";
const description =
    "Scale any D&D 5e monster to a new challenge rating. Get adjusted HP, AC, stats, attack bonus, save DC, and DPR. Export-ready statblocks with 2014 and 2024 guidance.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "D&D monster scaler",
            "CR scaling tool",
            "5e challenge rating calculator",
            "monster statblock generator",
            "D&D monster resizer",
            "adjust monster CR",
            "2014 rules",
            "2024 rules",
        ],
        alternates: buildAlternates(locale, "/monster-scaler"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/monster-scaler"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-monster-scaler.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr monster scaler – before and after statblock",
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
}

export default function MonsterScalerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
