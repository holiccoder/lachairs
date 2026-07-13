const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  try {
    const resp = await page.goto('https://www.atlaschairs.com/metal-folding-chairs', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('status:', resp.status());
    const html = await page.content();
    console.log(html.slice(0, 2000));
    await require('fs').promises.writeFile('D:/projects/lachairs/scripts/atlas-listing.html', html);
    console.log('saved to atlas-listing.html, length:', html.length);
  } catch (e) {
    console.error('ERR:', e.message);
  }
  await browser.close();
})();
