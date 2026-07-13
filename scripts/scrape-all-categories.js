const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createFetcher, randomBetween } = require('./lib/fetch-page');
const { parseListing, findNextPageUrl } = require('./lib/parse-listing');
const { parseProduct, cleanImageUrl } = require('./lib/parse-product');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'public', 'atlas-scrape');
const CACHE_ROOT = path.join(PROJECT_ROOT, '.data-cache', 'atlas-scrape');

const JOBS = [
  { url: 'https://www.atlaschairs.com/cross-back-chairs?material=935', folder: 'cross-back-chairs-material-935' },
  { url: 'https://www.atlaschairs.com/banquet-chairs', folder: 'banquet-chairs' },
  { url: 'https://www.atlaschairs.com/metal-stacking-chairs', folder: 'metal-stacking-chairs' },
  { url: 'https://www.atlaschairs.com/cocktail-tables', folder: 'cocktail-tables-first-12', limit: 12 },
  { url: 'https://www.atlaschairs.com/farm-tables', folder: 'farm-tables-first-page', limit: 'first-page' },
  { url: 'https://www.atlaschairs.com/polyester-tablecloths', folder: 'polyester-tablecloths-first-3', limit: 3 },
  { url: 'https://www.atlaschairs.com/catalogsearch/result/?q=Clear+chiavari+chairs', folder: 'clear-chiavari-chairs-search-first-3', limit: 3 },
  { url: 'https://www.atlaschairs.com/folding-chair-carts-dollies', folder: 'folding-chair-carts-dollies' },
  { url: 'https://www.atlaschairs.com/monarch-throne-chair.html#92=99', folder: 'monarch-throne-chair', type: 'product' },
  { url: 'https://www.atlaschairs.com/bamboo-folding-chair-stick-back.html', folder: 'bamboo-folding-chair-stick-back', type: 'product' },
];

const USE_PROXY = process.env.ATLAS_PROXY !== 'false';
const PROXY_URL = process.env.ATLAS_PROXY || 'http://127.0.0.1:7890';
const FORCE_REFRESH = process.argv.includes('--force');

function sanitizeFilename(name) {
  return name.replace(/[<>":/\\|?*\s]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120) || 'image';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(imageUrl, destPath, proxy) {
  const config = { responseType: 'arraybuffer', timeout: 30000 };
  if (proxy) {
    config.proxy = { protocol: 'http', host: '127.0.0.1', port: 7890 };
  }
  const resp = await axios.get(imageUrl, config);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, resp.data);
  return destPath;
}

async function collectListingProducts(fetcher, startUrl, limit, folder) {
  const products = [];
  let pageUrl = startUrl;
  let pageCount = 0;

  while (pageUrl) {
    pageCount++;
    console.log(`  listing page ${pageCount}: ${pageUrl}`);
    const cacheFile = path.join(folder, 'listings', `page_${pageCount}.html`);
    const { html } = await fetcher.fetchPage(pageUrl, { cacheFile: FORCE_REFRESH ? null : cacheFile, postLoadDelay: 2500 });
    const pageProducts = parseListing(html, pageUrl);
    console.log(`    found ${pageProducts.length} products`);

    for (const p of pageProducts) {
      products.push(p);
      if (typeof limit === 'number' && products.length >= limit) {
        return products.slice(0, limit);
      }
    }

    if (limit === 'first-page') {
      return products;
    }

    const nextUrl = findNextPageUrl(html, pageUrl);
    if (!nextUrl || nextUrl === pageUrl) {
      break;
    }
    pageUrl = nextUrl;
    await fetcher.sleep(randomBetween(3000, 5000));
  }

  return products;
}

async function scrapeProduct(fetcher, productUrl, listingName, folder, imageDir, errors, sourceListingUrl) {
  const slug = sanitizeFilename(path.basename(new URL(productUrl).pathname, '.html'));
  const cacheFile = path.join(folder, 'products', `${slug}.html`);

  try {
    const { html } = await fetcher.fetchPage(productUrl, { cacheFile: FORCE_REFRESH ? null : cacheFile, postLoadDelay: 3000 });
    const parsed = parseProduct(html, productUrl, listingName);

    if (!parsed.sku) {
      console.warn(`    no SKU found for ${productUrl}`);
    }

    const productFolderName = sanitizeFilename(parsed.sku || slug);
    const productImageDir = path.join(imageDir, productFolderName);
    fs.mkdirSync(productImageDir, { recursive: true });

    const localImages = [];
    for (let i = 0; i < parsed.images.length; i++) {
      const rawUrl = parsed.images[i];
      const baseUrl = cleanImageUrl(rawUrl);
      const ext = path.extname(new URL(baseUrl).pathname) || '.jpg';
      const filename = `${String(i).padStart(2, '0')}${ext}`;
      const destPath = path.join(productImageDir, filename);
      try {
        await downloadImage(rawUrl, destPath, USE_PROXY);
        const relativePath = path.relative(PROJECT_ROOT, destPath).replace(/\\/g, '/');
        localImages.push('/' + relativePath);
      } catch (imgErr) {
        console.error(`    image download failed: ${rawUrl}`, imgErr.message);
      }
    }

    return {
      categoryFolder: folder,
      sourceListingUrl: sourceListingUrl || productUrl,
      productUrl,
      listingName,
      title: parsed.title,
      sku: parsed.sku,
      brand: parsed.brand,
      price: parsed.price,
      description: parsed.description,
      images: parsed.images,
      localImages,
      specifications: parsed.specifications,
      magento: {
        sku: parsed.sku || slug,
        name: parsed.title || listingName || slug,
        attributeSetId: 4,
        price: 0,
        weight: 0,
        description: parsed.description || '',
        urlKey: parsed.urlKey || slug,
        categoryIds: [],
        status: 1,
        visibility: 4,
        typeId: 'simple',
      },
    };
  } catch (err) {
    console.error(`  ERROR scraping ${productUrl}:`, err.message);
    errors.push({ url: productUrl, error: err.message, time: new Date().toISOString() });
    return null;
  }
}

async function runJob(fetcher, job) {
  const folder = job.folder;
  const outDir = path.join(OUTPUT_ROOT, folder);
  const imageDir = path.join(outDir, 'images');
  const cacheDir = path.join(CACHE_ROOT, folder);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(imageDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });

  console.log(`\n=== ${folder} ===`);

  let productUrls = [];
  const isProductPage = job.type === 'product' || job.url.endsWith('.html');

  if (isProductPage) {
    productUrls = [{ name: '', url: job.url }];
    console.log(`  product detail page: ${job.url}`);
  } else {
    productUrls = await collectListingProducts(fetcher, job.url, job.limit, folder);
    console.log(`  total products to scrape: ${productUrls.length}`);
  }

  const errors = [];
  const results = [];
  const seenSkus = new Map();

  for (let i = 0; i < productUrls.length; i++) {
    const { name, url } = productUrls[i];
    console.log(`  [${i + 1}/${productUrls.length}] ${url}`);
    const product = await scrapeProduct(fetcher, url, name, folder, imageDir, errors, isProductPage ? undefined : job.url);
    if (product) {
      const key = product.sku || product.magento.urlKey;
      const existing = seenSkus.get(key);
      if (existing) {
        // Same SKU from multiple listing URLs (configurable variants)
        existing.variantUrls = existing.variantUrls || [];
        if (!existing.variantUrls.includes(product.productUrl)) {
          existing.variantUrls.push(product.productUrl);
        }
        console.log(`    duplicate SKU ${key}, recorded variant URL`);
      } else {
        product.index = results.length;
        product.variantUrls = [];
        seenSkus.set(key, product);
        results.push(product);
      }
    }
    if (i < productUrls.length - 1) {
      await fetcher.sleep(randomBetween(2000, 4000));
    }
  }

  fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify(results, null, 2));
  if (errors.length) {
    fs.writeFileSync(path.join(outDir, 'errors.json'), JSON.stringify(errors, null, 2));
  }

  console.log(`  saved ${results.length} products, ${errors.length} errors`);
  return { folder, count: results.length, errors: errors.length };
}

async function main() {
  console.log(`Starting Atlas scrape. Proxy: ${USE_PROXY ? PROXY_URL : 'disabled'}. Force: ${FORCE_REFRESH}`);

  const fetcher = await createFetcher({
    proxy: USE_PROXY ? PROXY_URL : null,
    cacheDir: CACHE_ROOT,
  });

  const summary = [];
  try {
    for (const job of JOBS) {
      const result = await runJob(fetcher, job);
      summary.push(result);
    }
  } finally {
    await fetcher.close();
  }

  // Combined report (deduplicate by SKU globally)
  const allProducts = [];
  const globalSeenSkus = new Set();
  const globalDuplicates = [];
  for (const job of JOBS) {
    const file = path.join(OUTPUT_ROOT, job.folder, 'products.json');
    if (fs.existsSync(file)) {
      const products = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const p of products) {
        if (globalSeenSkus.has(p.sku)) {
          globalDuplicates.push({ sku: p.sku, folder: p.categoryFolder, url: p.productUrl });
          continue;
        }
        globalSeenSkus.add(p.sku);
        allProducts.push(p);
      }
    }
  }
  fs.writeFileSync(path.join(OUTPUT_ROOT, 'all-products.json'), JSON.stringify(allProducts, null, 2));

  fs.writeFileSync(path.join(OUTPUT_ROOT, 'scrape-report.json'), JSON.stringify({
    time: new Date().toISOString(),
    summary,
    totalUniqueProducts: allProducts.length,
    globalDuplicates: globalDuplicates.length ? globalDuplicates : undefined,
  }, null, 2));

  console.log('\n=== Summary ===');
  summary.forEach(s => console.log(`${s.folder}: ${s.count} products, ${s.errors} errors`));
  console.log(`Total products: ${allProducts.length}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
