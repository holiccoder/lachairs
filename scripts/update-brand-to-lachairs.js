const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const SCRAPE_ROOT = path.join(__dirname, '..', 'public', 'atlas-scrape');
const METAL_FILE = path.join(__dirname, 'atlas-metal-folding-chairs.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function updateProductBrand(product) {
  let changed = false;

  if (product.brand) {
    product.brand = 'Lachairs';
    changed = true;
  }

  if (product.specifications && product.specifications['Brand']) {
    product.specifications['Brand'] = 'Lachairs';
    changed = true;
  }

  const newDescription = buildSpecsTable(product.specifications);
  if (newDescription && newDescription !== product.description) {
    product.description = newDescription;
    if (product.magento) product.magento.description = newDescription;
    changed = true;
  }

  return changed;
}

async function updateMagentoDescriptions(sku, description) {
  try {
    await axios.put(`${API_BASE}products/${encodeURIComponent(sku)}`, {
      product: {
        sku,
        custom_attributes: [
          { attribute_code: 'description', value: description },
          { attribute_code: 'short_description', value: description },
        ],
      },
    }, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || err.message };
  }
}

async function processJsonFile(filePath, isMetalFile = false) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const products = Array.isArray(data) ? data : data.products;
  if (!Array.isArray(products)) return { updated: 0, products: [] };

  let updated = 0;
  const toSync = [];

  products.forEach(p => {
    if (updateProductBrand(p)) {
      updated++;
      if (p.sku || p.magento?.sku) {
        toSync.push({
          sku: p.sku || p.magento.sku,
          description: p.description,
        });
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { updated, toSync };
}

async function main() {
  // Update all scraped products
  const productsFiles = fs.readdirSync(SCRAPE_ROOT)
    .map(name => path.join(SCRAPE_ROOT, name, 'products.json'))
    .filter(fs.existsSync);
  productsFiles.push(path.join(SCRAPE_ROOT, 'all-products.json'));

  let allToSync = [];
  let totalUpdated = 0;

  for (const file of productsFiles) {
    const { updated, toSync } = await processJsonFile(file);
    if (updated > 0) {
      console.log(`Updated ${updated} product(s) in ${file}`);
      totalUpdated += updated;
      allToSync.push(...toSync);
    }
  }

  // Update metal folding chairs file
  if (fs.existsSync(METAL_FILE)) {
    const { updated, toSync } = await processJsonFile(METAL_FILE, true);
    if (updated > 0) {
      console.log(`Updated ${updated} product(s) in ${METAL_FILE}`);
      totalUpdated += updated;
      allToSync.push(...toSync);
    }
  }

  console.log(`\nTotal local products updated: ${totalUpdated}`);

  // Deduplicate by SKU for Magento sync
  const seen = new Map();
  allToSync.forEach(item => {
    if (!seen.has(item.sku)) {
      seen.set(item.sku, item);
    }
  });
  const uniqueToSync = Array.from(seen.values());

  console.log(`Syncing ${uniqueToSync.length} unique SKUs to Magento...\n`);

  let success = 0;
  let failed = 0;
  for (let i = 0; i < uniqueToSync.length; i++) {
    const { sku, description } = uniqueToSync[i];
    console.log(`[${i + 1}/${uniqueToSync.length}] ${sku}`);
    const result = await updateMagentoDescriptions(sku, description);
    if (result.success) {
      success++;
    } else {
      failed++;
      console.error(`  FAILED: ${result.error}`);
    }
    if (i < uniqueToSync.length - 1) await sleep(500);
  }

  console.log('\n=== Magento Sync Summary ===');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
