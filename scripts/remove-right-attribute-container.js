const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const files = [
  'D:/projects/lachairs/scripts/product-pages/product_00.html',
  'D:/projects/lachairs/scripts/product-pages/product_01.html',
  'D:/projects/lachairs/scripts/product-pages/product_02.html',
  'D:/projects/lachairs/scripts/product-pages/product_03.html',
  'D:/projects/lachairs/scripts/product-pages/product_04.html',
  'D:/projects/lachairs/scripts/product-pages/product_05.html',
  'D:/projects/lachairs/scripts/product_Titan_Series_Premium_Triple_Braced_Fabric_Padded_M.html',
  'D:/projects/lachairs/scripts/product_Titan_Series_Premium_Triple_Braced_Steel_Folding_C.html',
  'D:/projects/lachairs/scripts/product_Titan_Series_Premium_Triple_Braced_Vinyl_Padded_Me.html',
  'D:/projects/lachairs/scripts/product_Titan_Series__Premium_Triple_Braced_Fabric_Padded_.html',
];

const selector = '#maincontent > div.product-attributes-section > div > div.right-attribute-container';

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('SKIP (not found):', file);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.log('SKIP (no match):', file);
    continue;
  }

  elements.forEach((el) => el.remove());

  fs.writeFileSync(file, dom.serialize());
  console.log('REMOVED', elements.length, 'element(s) from', file);
}
