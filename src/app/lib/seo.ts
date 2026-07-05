const SITE_URL = "https://crealizr.net";
export const LOCALES = ["en", "el", "ru", "de", "fr", "it"] as const;
export type SiteLocale = (typeof LOCALES)[number];

/** Returns `alternates.languages` for all 6 locales pointing at `/{locale}{path}`. */
export function buildHreflang(path: string): Record<string, string> {
    const clean = path.startsWith("/") ? path : `/${path}`;
    return Object.fromEntries([
        ...LOCALES.map(l => [l, `${SITE_URL}/${l}${clean === "/" ? "" : clean}`]),
        ["x-default", `${SITE_URL}/en${clean === "/" ? "" : clean}`],
    ]);
}
