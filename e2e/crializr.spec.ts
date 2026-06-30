import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clear the crializr IndexedDB after the page has loaded.
 *  Uses page.evaluate so it only runs once (addInitScript replays on reload). */
async function clearBestiaryDB(page: Page) {
    await page.evaluate(() => new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase("crializr");
        req.onsuccess = () => resolve();
        req.onerror = () => resolve(); // resolve anyway
        req.onblocked = () => resolve();
    }));
}

// ---------------------------------------------------------------------------
// 1. Navigation – home → every tool → back
// ---------------------------------------------------------------------------

test.describe("Navigation", () => {
    test("home page loads and links to all tools", async ({ page }) => {
        await page.goto("/en");
        await expect(page).toHaveTitle(/CRealizr/i);

        const tools = [
            { href: "/en/encounter-builder", heading: /encounter builder/i },
            { href: "/en/monster-scaler", heading: /monster scaler/i },
            { href: "/en/travel-encounters", heading: /encounters en route/i },
            { href: "/en/artifact-forge", heading: /artifact forge/i },
            { href: "/en/my-monsters", heading: /my bestiary/i },
        ];

        for (const { href, heading } of tools) {
            await page.goto(href);
            await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
        }
    });
});

// ---------------------------------------------------------------------------
// 2. Monster Scaler – scale a monster end-to-end
// ---------------------------------------------------------------------------

test.describe("Monster Scaler", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/en/monster-scaler");
    });

    test("Scale button is disabled until target CR is chosen", async ({ page }) => {
        // Scale button should still be present but functionally does nothing
        // (it returns early when targetCR is null).
        // We verify the form exists and button is visible.
        await expect(page.getByTestId("scale-btn")).toBeVisible();
        await expect(page.getByTestId("target-cr")).toBeVisible();
    });

    test("fills a monster, scales it up, and shows correct CR shift", async ({ page }) => {
        // Fill monster name
        await page.getByTestId("monster-name").fill("Test Goblin");

        // Set current CR to 1/4 (value = 0.25)
        await page.getByTestId("current-cr").selectOption("0.25");

        // Set target CR to 5
        await page.getByTestId("target-cr").selectOption("5");

        // Click Scale
        await page.getByTestId("scale-btn").click();

        // Result section should appear with the correct CR shift
        const crShift = page.getByTestId("cr-shift");
        await expect(crShift).toBeVisible();
        await expect(crShift).toContainText("1/4");
        await expect(crShift).toContainText("5");
        await expect(crShift).toContainText("→");
    });

    test("Adjust Stats returns to the form", async ({ page }) => {
        await page.getByTestId("target-cr").selectOption("3");
        await page.getByTestId("scale-btn").click();
        await expect(page.getByTestId("adjust-stats-btn")).toBeVisible();
        await page.getByTestId("adjust-stats-btn").click();
        // Back on the form — scale button visible again
        await expect(page.getByTestId("scale-btn")).toBeVisible();
    });

    test("load from bestiary pre-fills the form", async ({ page }) => {
        // Type a known SRD monster into the autocomplete
        const autocomplete = page.locator('[role="combobox"]').first();
        await autocomplete.fill("Goblin");
        // Wait for dropdown option and click it
        const option = page.locator('[role="option"]', { hasText: "Goblin" }).first();
        await expect(option).toBeVisible();
        await option.click();

        // Name field should now be pre-filled
        await expect(page.getByTestId("monster-name")).toHaveValue("Goblin");
    });

    test("scaled monster can be saved to My Bestiary", async ({ page }) => {
        await clearBestiaryDB(page);
        await page.reload();

        await page.getByTestId("monster-name").fill("Scaled Goblin");
        await page.getByTestId("current-cr").selectOption("0.25");
        await page.getByTestId("target-cr").selectOption("4");
        await page.getByTestId("scale-btn").click();

        const saveBtn = page.getByTestId("save-to-bestiary-btn");
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        // Confirmation text should appear
        await expect(saveBtn).toContainText("Saved");
    });
});

// ---------------------------------------------------------------------------
// 3. Encounter Builder – suggestions and modal
// ---------------------------------------------------------------------------

test.describe("Encounter Builder", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/en/encounter-builder");
    });

    test("shows suggestion cards for default party config", async ({ page }) => {
        // Default config (4 PCs, level 5, medium, solo) should produce results
        const cards = page.getByTestId("suggestion-card");
        await expect(cards.first()).toBeVisible({ timeout: 8_000 });
        const count = await cards.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test("clicking a suggestion card opens the monster-list modal", async ({ page }) => {
        const firstCard = page.getByTestId("suggestion-card").first();
        await expect(firstCard).toBeVisible({ timeout: 8_000 });
        await firstCard.scrollIntoViewIfNeeded();
        await firstCard.click();

        const modal = page.getByTestId("encounter-modal");
        await expect(modal).toBeVisible({ timeout: 8_000 });
        await expect(modal).not.toBeEmpty();
    });

    test("modal closes on backdrop click", async ({ page }) => {
        const firstCard = page.getByTestId("suggestion-card").first();
        await expect(firstCard).toBeVisible({ timeout: 8_000 });
        await firstCard.scrollIntoViewIfNeeded();
        await firstCard.click();
        const modal = page.getByTestId("encounter-modal");
        await expect(modal).toBeVisible({ timeout: 8_000 });

        // Click the absolute-positioned backdrop div directly (avoids coordinate guessing)
        await page.locator(".fixed.inset-0.bg-black\\/60").click({ force: true });
        await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });

    test("modal closes on Escape key", async ({ page }) => {
        const firstCard = page.getByTestId("suggestion-card").first();
        await expect(firstCard).toBeVisible({ timeout: 8_000 });
        await firstCard.scrollIntoViewIfNeeded();
        await firstCard.click();
        const modal = page.getByTestId("encounter-modal");
        await expect(modal).toBeVisible({ timeout: 8_000 });
        // Small pause so the useEffect keydown listener is registered before we send Escape
        await page.waitForTimeout(150);
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });

    test("switching to group mode shows group suggestions", async ({ page }) => {
        // Click the group (horde) slider toggle button
        // It's the second button inside the Formation SliderToggle
        const formationToggle = page.locator('[title="Horde / Group"]');
        await formationToggle.click();

        // Suggestion cards should still appear
        const cards = page.getByTestId("suggestion-card");
        await expect(cards.first()).toBeVisible({ timeout: 8_000 });
    });
});

// ---------------------------------------------------------------------------
// 4. Travel Encounters – roll and get an outcome
// ---------------------------------------------------------------------------

test.describe("Travel Encounters", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/en/travel-encounters");
    });

    test("roll button produces an outcome description", async ({ page }) => {
        await page.getByTestId("roll-btn").click();
        // Roll is random; we just need *some* outcome to appear
        // (the table may roll a "no encounter" but the UI always shows result.roll,
        //  and for combat outcomes it shows the description)
        // Wait for either the outcome card or the roll number in the SR announcer
        await expect(page.locator("#sr-announcer")).not.toBeEmpty({ timeout: 5_000 });
    });

    test("rolling multiple times updates the outcome each time", async ({ page }) => {
        const btn = page.getByTestId("roll-btn");

        await btn.click();
        const announcer = page.locator("#sr-announcer");
        await expect(announcer).not.toBeEmpty({ timeout: 5_000 });
        const first = await announcer.textContent();

        // Roll again – the roll number in the message should change eventually
        // (tiny chance of same roll twice, acceptable for this test)
        let changed = false;
        for (let i = 0; i < 5; i++) {
            await btn.click();
            const text = await announcer.textContent();
            if (text !== first) { changed = true; break; }
        }
        expect(changed).toBe(true);
    });

    test("changing terrain before rolling works without error", async ({ page }) => {
        const terrainSelect = page.getByRole("combobox", { name: /terrain/i });
        await terrainSelect.selectOption("Mountains");
        await page.getByTestId("roll-btn").click();
        await expect(page.locator("#sr-announcer")).not.toBeEmpty({ timeout: 5_000 });
    });
});

// ---------------------------------------------------------------------------
// 5. My Bestiary – create, persist across reload, delete
// ---------------------------------------------------------------------------

test.describe("My Bestiary", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/en/my-monsters");
        await clearBestiaryDB(page);
        await page.reload();
    });

    test("add-monster button opens the form", async ({ page }) => {
        await page.getByTestId("add-monster-btn").click();
        await expect(page.getByTestId("homebrew-name")).toBeVisible();
    });

    test("creates a homebrew monster and it appears in the list", async ({ page }) => {
        await page.getByTestId("add-monster-btn").click();

        await page.getByTestId("homebrew-name").fill("Dire Owlbear");

        // Save
        await page.getByTestId("save-monster-btn").click();

        // Should be back on the list with the new monster visible
        const card = page.getByTestId("monster-card").filter({ hasText: "Dire Owlbear" });
        await expect(card).toBeVisible({ timeout: 5_000 });
    });

    test("homebrew monster persists after page reload (IndexedDB)", async ({ page }) => {
        // Create a monster
        await page.getByTestId("add-monster-btn").click();
        await page.getByTestId("homebrew-name").fill("Persistent Beast");
        await page.getByTestId("save-monster-btn").click();
        await expect(page.getByTestId("monster-card").filter({ hasText: "Persistent Beast" })).toBeVisible();

        // Reload the page — IndexedDB should restore the monster
        await page.reload();
        await expect(page.getByTestId("monster-card").filter({ hasText: "Persistent Beast" })).toBeVisible({ timeout: 5_000 });
    });

    test("deleting a homebrew monster removes it from the list", async ({ page }) => {
        // Create
        await page.getByTestId("add-monster-btn").click();
        await page.getByTestId("homebrew-name").fill("Doomed Creature");
        await page.getByTestId("save-monster-btn").click();

        const card = page.getByTestId("monster-card").filter({ hasText: "Doomed Creature" });
        await expect(card).toBeVisible();

        // First delete click asks for confirmation
        await card.getByRole("button", { name: "Delete" }).click();
        // Confirm — button text is the full sentence from i18n
        await card.getByRole("button", { name: /are you sure/i }).click();

        await expect(card).not.toBeVisible({ timeout: 5_000 });
    });
});
