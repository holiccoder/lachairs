const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const INPUT_FILE = path.join(__dirname, '..', 'public', 'atlas-scrape', 'all-products.json');
const REPORT_FILE = path.join(__dirname, '..', 'public', 'atlas-scrape', 'magento-upload-report.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPayload(product) {
  const m = product.magento || {};
  const customAttributes = [];

  if (m.description?.trim()) {
    customAttributes.push({ attribute_code: 'description', value: m.description.trim() });
  }

  if (m.urlKey?.trim()) {
    customAttributes.push({ attribute_code: 'url_key', value: m.urlKey.trim() });
  }

  const categoryIds = (m.categoryIds || [])
    .map(id => (typeof id === 'string' ? id.trim() : String(id)))
    .filter(Boolean);

  if (categoryIds.length > 0) {
    customAttributes.push({ attribute_code: 'category_ids', value: categoryIds });
  }

  return {
    product: {
      sku: (m.sku || product.sku || '').trim(),
      name: (m.name || product.title || '').trim(),
      attribute_set_id: Number(m.attributeSetId || 4),
      price: Number(m.price || 0),
      status: Number(m.status || 1),
      visibility: Number(m.visibility || 4),
      type_id: m.typeId || 'simple',
      weight: Number(m.weight || 0),
      custom_attributes: customAttributes,
    },
  };
}

async function uploadProduct(product, index, total) {
  const payload = buildPayload(product);
  const sku = payload.product.sku;

  console.log(`[${index + 1}/${total}] Uploading ${sku}...`);

  try {
    const res = await axios.post(`${API_BASE}products`, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return {
      sku,
      success: true,
      productId: res.data?.id,
      name: res.data?.name,
      status: res.status,
    };
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

    return {
      sku,
      success: false,
      status: response?.status,
      error: formattedMessage,
      raw: response?.data,
    };
  }
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Input file not found:', INPUT_FILE);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Starting upload of ${products.length} products to ${API_BASE}products\n`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const result = await uploadProduct(products[i], i, products.length);
    results.push(result);
    if (i < products.length - 1) {
      await sleep(1000);
    }
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const duplicateSkus = failed.filter(r => r.error && r.error.toLowerCase().includes('already exists'));

  const report = {
    time: new Date().toISOString(),
    apiBase: API_BASE,
    total: products.length,
    successful: successful.length,
    failed: failed.length,
    duplicateSkus: duplicateSkus.length,
    successfulSkus: successful.map(r => ({ sku: r.sku, productId: r.productId, name: r.name })),
    failedDetails: failed.map(r => ({ sku: r.sku, status: r.status, error: r.error })),
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log('\n=== Upload Summary ===');
  console.log(`Total:    ${report.total}`);
  console.log(`Success:  ${report.successful}`);
  console.log(`Failed:   ${report.failed}`);
  console.log(`Duplicates (already exist): ${report.duplicateSkus}`);
  console.log(`\nReport saved to: ${REPORT_FILE}`);

  if (failed.length > 0 && failed.length !== duplicateSkus.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
