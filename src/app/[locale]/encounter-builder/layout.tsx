import type { Metadata } from "next";
import { Suspense } from "react";
import { buildHreflang } from "@/app/lib/seo";

const title = "D&D 5e Encounter Builder | CRealizr";
const description =
    "Build balanced D&D 5e encounters using XP budget or CR match mode. Features a live hex battlefield, AoE hazards, cover system, and 2014/2024 ruleset support.";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title,
        description,
        keywords: [
            "D&D encounter builder",
            "D&D encounter calculator",
            "5e encounter balance",
            "encounter difficulty calculator",
            "XP budget D&D",
            "CR calculator 5e",
            "hex map D&D",
            "encounter builder 2024",
            "2014 rules",
        ],
        alternates: {
            canonical: "/encounter-builder",
            languages: buildHreflang("/encounter-builder"),
        },
        openGraph: {
            title,
            description,
            url: "/encounter-builder",
            type: "website",
            siteName: "CRealizr",
            images: [
                {
                    url: "/og-encounter-builder.svg",
                    width: 1200,
                    height: 630,
                    alt: "CRealizr encounter builder – hex battlefield and encounter suggestions",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-encounter-builder.svg"],
        },
    };
}

export default function EncounterBuilderLayout({ children }: { children: React.ReactNode }) {
    return <Suspense>{children}</Suspense>;
}
