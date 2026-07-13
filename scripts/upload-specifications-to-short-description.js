const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const SCRAPE_ROOT = path.join(__dirname, '..', 'public', 'atlas-scrape');
const INPUT_FILE = path.join(SCRAPE_ROOT, 'all-products.json');

function buildSpecsTable(specs) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) return '';

  const rows = entries
    .map(([key, value]) => `    <tr><th style="text-align:left;padding:8px;border:1px solid #ddd;background:#f5f5f5;">${escapeHtml(key)}</th><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(value)}</td></tr>`)
    .join('\n');

  return `<h3>Specifications</h3>
<table style="border-collapse:collapse;width:100%;max-width:600px;">
<tbody>
${rows}
</tbody>
</table>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateMagentoShortDescription(sku, shortDescription) {
  try {
    const res = await axios.put(`${API_BASE}products/${encodeURIComponent(sku)}`, {
      product: {
        sku,
        custom_attributes: [
          {
            attribute_code: 'short_description',
            value: shortDescription,
          },
        ],
      },
    }, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return { success: true, status: res.status };
  } catch (err) {
    return { success: false, status: err.response?.status, error: err.response?.data?.message || err.message };
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Updating short descriptions for ${products.length} products...\n`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const sku = p.sku || p.magento?.sku;
    const shortDescription = buildSpecsTable(p.specifications);

    if (!shortDescription) {
      console.log(`[${i + 1}/${products.length}] ${sku} — no specifications, skipped`);
      continue;
    }

    console.log(`[${i + 1}/${products.length}] ${sku} — ${Object.keys(p.specifications).length} specs`);
    const result = await updateMagentoShortDescription(sku, shortDescription);
    results.push({ sku, success: result.success, status: result.status, error: result.error });

    if (!result.success) {
      console.error(`  FAILED: ${result.error}`);
    }

    if (i < products.length - 1) {
      await sleep(500);
    }
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n=== Summary ===');
  console.log(`Products with specs: ${results.length}`);
  console.log(`Successful Magento updates: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed SKUs:');
    failed.forEach(f => console.log(`  ${f.sku}: ${f.error}`));
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
