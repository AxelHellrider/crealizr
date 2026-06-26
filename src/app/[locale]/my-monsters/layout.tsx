import type { Metadata } from "next";

const title = "My Monsters — Custom Monster Library | CRealizr";
const description =
    "Store, manage, and export your homebrew D&D monsters. Import custom monsters from JSON or build your own library for use across all CRealizr tools.";

export const metadata: Metadata = {
    title,
    description,
    keywords: [
        "homebrew monsters",
        "D&D custom monsters",
        "monster library",
        "D&D 5e homebrew",
        "custom monster manager",
        "import export monsters",
    ],
    alternates: {
        canonical: "/my-monsters",
    },
    openGraph: {
        title,
        description,
        url: "/my-monsters",
        type: "website",
        siteName: "CRealizr",
        images: [
            {
                url: "/og-default.svg",
                width: 1200,
                height: 630,
                alt: "CRealizr My Monsters library",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/og-default.svg"],
    },
};

export default function MyMonstersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
