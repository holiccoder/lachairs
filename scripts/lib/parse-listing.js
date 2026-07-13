const cheerio = require('cheerio');

function parseListing(html, baseUrl) {
  const $ = cheerio.load(html);
  const products = [];
  const seen = new Set();
  const base = new URL(baseUrl);

  $('.product-item-info').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a[href*="/"]').first();
    if (!$link.length) return;
    let url = $link.attr('href');
    if (!url) return;
    if (url.startsWith('/')) {
      url = `${base.origin}${url}`;
    }
    const name = ($el.find('.product-item-link, .product.name a').first().text().trim()) || $link.attr('title') || '';
    if (url && name && !seen.has(url)) {
      seen.add(url);
      products.push({ name, url });
    }
  });

  return products;
}

function findNextPageUrl(html, currentUrl) {
  const $ = cheerio.load(html);
  const current = new URL(currentUrl);

  // Look for Magento next pager link
  const nextHref = $('a.action.next').attr('href');
  if (nextHref) {
    if (nextHref.startsWith('/')) {
      return `${current.origin}${nextHref}`;
    }
    return nextHref;
  }

  // Fallback: parse ?p=N from pagination items
  const currentPage = Number(current.searchParams.get('p')) || 1;
  let nextPage = null;
  $('.pages-items a.page, .pages-items a').each((_, el) => {
    if (nextPage) return;
    const $el = $(el);
    const pageNum = Number($el.text().trim());
    if (!isNaN(pageNum) && pageNum === currentPage + 1) {
      let href = $el.attr('href');
      if (href) {
        if (href.startsWith('/')) {
          href = `${current.origin}${href}`;
        }
        nextPage = href;
      }
    }
  });

  return nextPage;
}

module.exports = { parseListing, findNextPageUrl };
