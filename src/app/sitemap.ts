import type { MetadataRoute } from "next";

const SITE_URL = "https://crealizr.net";
const LOCALES = ["en", "el", "ru", "de", "fr", "it"] as const;

type PageDef = {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
};

const pages: PageDef[] = [
    { path: "",                        changeFrequency: "weekly",  priority: 1.0 },
    { path: "/encounter-builder",      changeFrequency: "weekly",  priority: 0.9 },
    { path: "/monster-scaler",         changeFrequency: "weekly",  priority: 0.9 },
    { path: "/travel-encounters",      changeFrequency: "weekly",  priority: 0.8 },
    { path: "/artifact-forge",         changeFrequency: "weekly",  priority: 0.8 },
    { path: "/my-monsters",            changeFrequency: "monthly", priority: 0.7 },
    { path: "/encounter-builder/docs", changeFrequency: "monthly", priority: 0.6 },
    { path: "/monster-scaler/docs",    changeFrequency: "monthly", priority: 0.6 },
    { path: "/artifact-forge/docs",    changeFrequency: "monthly", priority: 0.5 },
    { path: "/my-monsters/docs",       changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact",                changeFrequency: "yearly",  priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [];

    for (const { path, changeFrequency, priority } of pages) {
        for (const locale of LOCALES) {
            entries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: now,
                changeFrequency,
                priority,
            });
        }
    }

    return entries;
}
