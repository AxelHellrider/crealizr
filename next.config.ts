import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-pwa ships no type declarations; require() sidesteps the TS error cleanly.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWAInit = require("next-pwa") as (
    opts: Record<string, unknown>,
) => (config: NextConfig) => NextConfig;

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    fallbacks: { document: "/offline.html" },
    runtimeCaching: [
        {
            urlPattern: /^\/_next\/static\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "next-static",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
        },
        {
            urlPattern: /^\/icons\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "app-icons",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        {
            urlPattern: /^\/(en|el|ru|de|fr|it)(\/.*)?$/,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "pages",
                expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
        },
        {
            urlPattern: /^\/api\/.*/i,
            handler: "NetworkOnly",
        },
    ],
});

const nextConfig: NextConfig = {
    // React Compiler: on in production, opt-in in dev via env var
    reactCompiler: process.env.NODE_ENV === "production" || process.env.REACT_COMPILER === "true",
    poweredByHeader: false,
    compress: true,
    experimental: {
        // Tree-shake heavy packages to reduce client bundle
        optimizePackageImports: ["framer-motion"],
    },
    async redirects() {
        return [
            { source: "/scale",               destination: "/monster-scaler",       permanent: true },
            { source: "/scale/docs",          destination: "/monster-scaler/docs",  permanent: true },
            { source: "/balance",             destination: "/encounter-builder",    permanent: true },
            { source: "/balance/docs",        destination: "/encounter-builder/docs", permanent: true },
            { source: "/items",               destination: "/artifact-forge",       permanent: true },
            { source: "/items/docs",          destination: "/artifact-forge/docs",  permanent: true },
            { source: "/encounters-en-route", destination: "/travel-encounters",    permanent: true },
        ];
    },
};

export default withPWA(withNextIntl(nextConfig));
