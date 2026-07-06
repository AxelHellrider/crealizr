const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 30000 });
  const icons = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')]
      .map(l => ({ rel: l.rel, href: l.href, type: l.type }))
  );
  console.log(JSON.stringify(icons, null, 2));
  const svgRes = await page.request.get('http://localhost:3000/crealizr_favicon.svg');
  console.log('svg status:', svgRes.status());
  await browser.close();
})();
