const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const INPUT_FILE = path.join(__dirname, '..', 'public', 'atlas-scrape', 'all-products.json');
const REPORT_FILE = path.join(__dirname, '..', 'public', 'atlas-scrape', 'magento-category-assignment-report.json');

// Category mapping based on scraped folder + product name
const FOLDER_CATEGORY_MAP = {
  'cross-back-chairs-material-935': ['212'], // Resin Cross Back Chairs
  'banquet-chairs': ['158'], // Banquet Chairs
  'metal-stacking-chairs': ['215'], // Metal Chairs
  'cocktail-tables-first-12': ['199'], // Cocktail Tables
  'farm-tables-first-page': ['200'], // Farm Tables
  'polyester-tablecloths-first-3': ['201'], // Tablecloths & Covers
  'clear-chiavari-chairs-search-first-3': ['211'], // Resin Chiavari Chairs
  'folding-chair-carts-dollies': ['157'], // Folding Chairs Parts & Dollies
  'monarch-throne-chair': ['159'], // Throne Chairs
  'bamboo-folding-chair-stick-back': ['155'], // Bamboo Folding Chairs
};

// SKU-level overrides for products that don't fit their folder's main category
const SKU_OVERRIDES = {
  'BCD9BASIC': ['161'], // Steel Chair Dolly for Stacking Chairs and Church Chairs
  'SP-BCC': ['160'], // Spandex Banquet Chair Cover
  'AVA41PAD': ['160'], // Replacement Pad for Ava Stainless Steel Dining Chair
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function assignCategory(sku, categoryIds) {
  const payload = {
    product: {
      sku,
      custom_attributes: [
        {
          attribute_code: 'category_ids',
          value: categoryIds,
        },
      ],
    },
  };

  try {
    const res = await axios.put(`${API_BASE}products/${encodeURIComponent(sku)}`, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return { success: true, status: res.status, categoryIds };
  } catch (err) {
    const response = err.response;
    const message = response?.data?.message || err.message;
    return { success: false, status: response?.status, error: message, categoryIds };
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Assigning categories to ${products.length} products...\n`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const sku = p.sku || p.magento?.sku;
    const folder = p.categoryFolder;
    const categoryIds = SKU_OVERRIDES[sku] || FOLDER_CATEGORY_MAP[folder] || [];

    console.log(`[${i + 1}/${products.length}] ${sku} → [${categoryIds.join(', ')}]`);
    const result = await assignCategory(sku, categoryIds);
    results.push({ sku, folder, categoryIds, ...result });

    if (i < products.length - 1) {
      await sleep(500);
    }
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  const report = {
    time: new Date().toISOString(),
    total: products.length,
    successful: successful.length,
    failed: failed.length,
    results,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log('\n=== Category Assignment Summary ===');
  console.log(`Total: ${report.total}`);
  console.log(`Successful: ${report.successful}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`\nReport saved to: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
