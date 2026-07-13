const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const url = `${API_BASE}products?searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`;
    console.log(`Fetching page ${page}...`);
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 60000,
    });

    const items = res.data.items || [];
    if (items.length === 0) break;

    products.push(...items);
    if (items.length < pageSize) break;
    page++;
  }

  return products;
}

function getCategoryIds(product) {
  // Try extension_attributes.category_links first
  const links = product.extension_attributes?.category_links;
  if (Array.isArray(links) && links.length > 0) {
    return links.map(l => l.category_id);
  }

  // Fallback to custom_attributes.category_ids
  const attr = product.custom_attributes?.find(a => a.attribute_code === 'category_ids');
  if (attr) {
    const value = attr.value;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') return value.split(',').filter(Boolean);
  }

  return [];
}

async function main() {
  const products = await fetchAllProducts();
  console.log(`\nTotal products in catalog: ${products.length}`);

  const uncategorized = products.filter(p => getCategoryIds(p).length === 0);
  console.log(`Products with empty categories: ${uncategorized.length}\n`);

  if (uncategorized.length === 0) {
    console.log('No uncategorized products found.');
    return;
  }

  console.log('ID | SKU | Name');
  console.log('---|-----|------');
  uncategorized.forEach(p => {
    console.log(`${p.id} | ${p.sku} | ${p.name}`);
  });
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
