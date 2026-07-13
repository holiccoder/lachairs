const cheerio = require('cheerio');

function cleanImageUrl(url) {
  if (!url) return url;
  return url.replace(/\?.*$/, '').replace(/&dpr=1%201x$/, '');
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

function parseProduct(html, productUrl, listingName = '') {
  const $ = cheerio.load(html);

  const title = $('h1.page-title .base, [data-ui-id="page-title-wrapper"]').first().text().trim() || null;

  const sku = $('.product.attribute.sku .value').first().text().trim() || null;

  let brand = $('.product-brand').first().text().trim() || null;

  const price = $('.product-info-price .price, .product-price-info-container .price').first().text().trim() || null;

  const description = $('.product.attribute.description .value, .product-description-block').first().text().trim() || null;

  const seenUrls = new Set();
  const images = [];
  $('.fotorama__stage__frame img, .gallery-placeholder__image, .fotorama__nav__frame img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (!src) return;
    const base = cleanImageUrl(src);
    if (!seenUrls.has(base)) {
      seenUrls.add(base);
      images.push(src);
    }
  });

  const specifications = {};
  $('#product-attribute-specs-table tr').each((_, row) => {
    const $row = $(row);
    const key = $row.find('th.col.label').first().text().trim();
    const value = $row.find('td.col.data').first().text().trim();
    if (key) specifications[key] = value;
  });

  if (!brand && specifications['Brand']) brand = specifications['Brand'];

  return {
    title,
    sku,
    brand,
    price,
    description,
    images,
    specifications,
    urlKey: urlKeyFromUrl(productUrl),
    listingName,
  };
}

module.exports = { parseProduct, cleanImageUrl, urlKeyFromUrl };
