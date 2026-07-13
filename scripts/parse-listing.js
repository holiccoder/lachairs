const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('D:/projects/lachairs/scripts/atlas-listing.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const products = [];
const seen = new Set();

document.querySelectorAll('.product-item-info').forEach(el => {
  const link = el.querySelector('a[href*="/"]');
  if (!link) return;
  const url = link.href;
  const nameEl = el.querySelector('.product-item-link, .product.name a');
  const name = nameEl ? nameEl.textContent.trim() : link.getAttribute('title') || '';
  if (url && name && !seen.has(url)) {
    seen.add(url);
    products.push({ name, url });
  }
});

fs.writeFileSync('D:/projects/lachairs/scripts/products.json', JSON.stringify(products, null, 2));
console.log('Saved', products.length, 'products');
