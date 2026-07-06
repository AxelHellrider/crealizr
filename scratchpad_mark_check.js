const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/alexn/AppData/Local/Temp/mark-header.png' });

  await page.click('button[aria-label="Open menu"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/alexn/AppData/Local/Temp/mark-sidebar.png' });

  // desktop check: sidebar wordmark still shows, header hidden
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Open menu"], button[aria-label="Close menu"]').catch(() => {});
  const toggle = await page.locator('button[aria-label="Open menu"], button[aria-label="Close menu"]').first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: 'C:/Users/alexn/AppData/Local/Temp/mark-desktop-sidebar.png' });

  await browser.close();
})();
