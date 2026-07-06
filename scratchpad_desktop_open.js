const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Open sidebar"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/alexn/AppData/Local/Temp/desktop-drawer-open.png' });
  await browser.close();
})();
