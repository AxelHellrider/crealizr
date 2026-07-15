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

/** Returns the locale-prefixed path for a page's own canonical/openGraph.url — `/{locale}{path}`. */
export function buildCanonicalPath(locale: string, path: string): string {
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${clean === "/" ? "" : clean}`;
}

/**
 * `alternates` for a specific route: a self-referencing canonical for the
 * given locale, plus the full hreflang set. Every page should call this
 * with its own path — omitting it (or hardcoding a path-less canonical)
 * makes the page collapse to the locale root in `<link rel="canonical">`.
 */
export function buildAlternates(locale: string, path: string) {
    return {
        canonical: buildCanonicalPath(locale, path),
        languages: buildHreflang(path),
    };
}
