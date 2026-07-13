const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const pagesDir = path.join(__dirname, 'product-pages');
const results = [];

function cleanImageUrl(url) {
  return url.replace(/\?.*$/, '').replace(/&dpr=1%201x$/, '');
}

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const file = path.join(pagesDir, `product_${String(i).padStart(2, '0')}.html`);
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const pageTitleEl = doc.querySelector('h1.page-title .base, [data-ui-id="page-title-wrapper"]');
  const pageTitle = pageTitleEl ? pageTitleEl.textContent.trim() : null;

  // SKU
  const skuEl = doc.querySelector('.product.attribute.sku .value');
  const sku = skuEl ? skuEl.textContent.trim() : null;

  // Brand
  let brand = null;
  const brandEl = doc.querySelector('.product-brand');
  if (brandEl) brand = brandEl.textContent.trim();

  // Price - not visible without login on this site
  const priceEl = doc.querySelector('.product-info-price .price, .product-price-info-container .price');
  const price = priceEl ? priceEl.textContent.trim() : null;

  // Description / short description
  const descEl = doc.querySelector('.product.attribute.description .value, .product-description-block');
  const description = descEl ? descEl.textContent.trim() : null;

  // Images (deduplicate by base URL)
  const imageEls = doc.querySelectorAll('.fotorama__stage__frame img, .gallery-placeholder__image');
  const seenUrls = new Set();
  const images = [];
  [...imageEls].forEach(img => {
    const src = img.src;
    if (!src) return;
    const base = src.split('?')[0];
    if (!seenUrls.has(base)) {
      seenUrls.add(base);
      images.push(src);
    }
  });

  // Specifications
  const specs = {};
  const table = doc.querySelector('#product-attribute-specs-table');
  if (table) {
    table.querySelectorAll('tr').forEach(row => {
      const th = row.querySelector('th.col.label');
      const td = row.querySelector('td.col.data');
      if (th && td) {
        const key = th.textContent.trim();
        const value = td.textContent.trim();
        specs[key] = value;
      }
    });
  }

  // Use brand from specs if not found in header
  if (!brand && specs['Brand']) brand = specs['Brand'];

  results.push({
    index: i,
    listingName: p.name,
    pageTitle,
    url: p.url,
    sku,
    brand,
    price,
    description,
    images,
    specifications: specs
  });
}

const outPath = path.join(__dirname, 'atlas-metal-folding-chairs.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log('Saved', results.length, 'products to', outPath);
