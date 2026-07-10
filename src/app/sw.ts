/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist, type PrecacheEntry, type RuntimeCaching, type SerwistGlobalConfig } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const runtimeCaching: RuntimeCaching[] = [
    {
        matcher: /^\/icons\/.*/i,
        handler: new CacheFirst({
            cacheName: "app-icons",
            plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 })],
        }),
    },
    {
        matcher: ({ request }) => request.mode === "navigate",
        // Falls back to the precached offline page when the network fails and
        // nothing usable is cached yet — NetworkFirst alone just rejects in that case.
        handler: async ({ request, event }) => {
            const strategy = new NetworkFirst({ cacheName: "pages" });
            try {
                return await strategy.handle({ request, event });
            } catch {
                const offline = await caches.match("/offline.html");
                return offline ?? Response.error();
            }
        },
    },
    ...defaultCache,
];

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching,
});

serwist.addEventListeners();
