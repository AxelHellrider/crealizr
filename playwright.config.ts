import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    retries: 0,
    reporter: "list",
    use: {
        baseURL: "http://localhost:3000",
        headless: true,
        locale: "en",
        // Faster than waiting for network idle on every navigation
        actionTimeout: 10_000,
        navigationTimeout: 20_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    // Reuse the already-running dev server; fail fast if it's not up
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
    },
});
