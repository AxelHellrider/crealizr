import type { Metadata } from "next";
import { buildAlternates, buildCanonicalPath } from "@/app/lib/seo";

const title = "Monster Scaler – Formulas & CR Matrix | CRealizr";
const description =
    "Exact formulas used by the CRealizr monster scaler: HP scaling, AC guardrails, ability score steps, DPR estimation, and the full 2014/2024 CR matrix tables.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title,
        description,
        keywords: [
            "D&D monster scaler formulas",
            "CR matrix 5e",
            "D&D challenge rating table",
            "monster HP scaling formula",
            "5e scaling math",
            "2014 CR table",
            "2024 CR table",
        ],
        alternates: buildAlternates(locale, "/monster-scaler/docs"),
        openGraph: {
            title,
            description,
            url: buildCanonicalPath(locale, "/monster-scaler/docs"),
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-monster-scaler-docs.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr monster scaler formulas and CR matrix",
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
}

export default function MonsterScalerDocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
