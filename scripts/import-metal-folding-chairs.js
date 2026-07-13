const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const INPUT_FILE = path.join(__dirname, 'atlas-metal-folding-chairs.json');

const CATEGORY_IDS = ['126', '143', '153'];
const PRICE = 50;
const QTY = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTitle(title) {
  return title
    .replace(/Titan Series™/gi, '')
    .replace(/Titan Series/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s-\s/g, ' - ')
    .trim();
}

function urlKeyFromUrl(productUrl) {
  try {
    const u = new URL(productUrl);
    const base = u.pathname.split('/').pop() || '';
    return base.replace(/\.html$/, '');
  } catch {
    return '';
  }
}

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

function buildPayload(product) {
  const sku = product.sku;
  const name = cleanTitle(product.pageTitle || product.listingName || sku);
  const urlKey = urlKeyFromUrl(product.url);
  const description = buildSpecsTable(product.specifications);

  const customAttributes = [];
  if (description) {
    customAttributes.push({ attribute_code: 'description', value: description });
    customAttributes.push({ attribute_code: 'short_description', value: description });
  }
  if (urlKey) {
    customAttributes.push({ attribute_code: 'url_key', value: urlKey });
  }
  if (CATEGORY_IDS.length > 0) {
    customAttributes.push({ attribute_code: 'category_ids', value: CATEGORY_IDS });
  }

  return {
    product: {
      sku,
      name,
      attribute_set_id: 4,
      price: PRICE,
      status: 1,
      visibility: 4,
      type_id: 'simple',
      weight: 0,
      custom_attributes: customAttributes,
      extension_attributes: {
        stock_item: {
          qty: QTY,
          is_in_stock: true,
        },
      },
    },
  };
}

async function createProduct(payload) {
  try {
    const res = await axios.post(`${API_BASE}products`, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return { success: true, status: res.status, productId: res.data?.id, sku: res.data?.sku };
  } catch (err) {
    const response = err.response;
    const message = response?.data?.message || err.message;
    const parameters = response?.data?.parameters;
    let formattedMessage = message;
    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((value, idx) => {
        formattedMessage = formattedMessage.replaceAll(`%${idx + 1}`, value);
      });
    }
    return { success: false, status: response?.status, error: formattedMessage };
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Loaded ${products.length} products from ${INPUT_FILE}`);

  // Deduplicate by SKU
  const seen = new Map();
  products.forEach(p => {
    if (!seen.has(p.sku)) {
      seen.set(p.sku, p);
    }
  });
  const uniqueProducts = Array.from(seen.values());
  console.log(`Unique SKUs to import: ${uniqueProducts.length}\n`);

  const results = [];
  for (let i = 0; i < uniqueProducts.length; i++) {
    const p = uniqueProducts[i];
    const payload = buildPayload(p);
    console.log(`[${i + 1}/${uniqueProducts.length}] ${payload.product.sku} → ${payload.product.name}`);
    const result = await createProduct(payload);
    results.push({ sku: payload.product.sku, name: payload.product.name, ...result });

    if (!result.success) {
      console.error(`  FAILED: ${result.error}`);
    }

    if (i < uniqueProducts.length - 1) {
      await sleep(1000);
    }
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n=== Import Summary ===');
  console.log(`Total unique: ${uniqueProducts.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach(f => console.log(`  ${f.sku}: ${f.error}`));
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
