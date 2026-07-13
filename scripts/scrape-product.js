const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const outDir = path.join(__dirname, 'product-pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`Fetching ${i + 1}/${products.length}:`, p.name);
    const page = await context.newPage();
    try {
      const resp = await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
      const html = await page.content();
      const filename = `product_${String(i).padStart(2, '0')}.html`;
      fs.writeFileSync(path.join(outDir, filename), html);
      results.push({ index: i, name: p.name, url: p.url, filename, status: resp.status(), length: html.length });
    } catch (e) {
      console.error('  ERR:', e.message);
      results.push({ index: i, name: p.name, url: p.url, error: e.message });
    }
    await page.close();
  }

  fs.writeFileSync(path.join(__dirname, 'product-fetch-log.json'), JSON.stringify(results, null, 2));
  console.log('Done. Fetched', results.filter(r => r.filename).length, 'pages.');
  await browser.close();
})();
