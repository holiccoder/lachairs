const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createFetcher } = require('./lib/fetch-page');
const { parseProduct } = require('./lib/parse-product');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const PROXY = process.env.ATLAS_PROXY !== 'false' ? (process.env.ATLAS_PROXY || 'http://127.0.0.1:7890') : null;
const PROJECT_ROOT = path.resolve(__dirname, '..');

const PRODUCTS = [
  {
    url: 'https://www.atlaschairs.com/replacement-cushion-for-resin-folding-chairs.html',
    folder: 'replacement-cushion-for-resin-folding-chairs',
    categoryIds: ['126', '143', '156'],
  },
  {
    url: 'https://www.atlaschairs.com/metal-folding-chair-with-2-cushion-black-vinyl.html',
    folder: 'metal-folding-chair-with-2-cushion-black-vinyl',
    categoryIds: ['126', '143', '156'],
  },
];

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

function mimeTypeFromExt(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

function sanitizeFilename(name) {
  return name.replace(/[<>":/\\|?*\s]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120) || 'image';
}

async function downloadImage(imageUrl, destPath) {
  const config = { responseType: 'arraybuffer', timeout: 30000 };
  if (PROXY) {
    config.proxy = { protocol: 'http', host: '127.0.0.1', port: 7890 };
  }
  const resp = await axios.get(imageUrl, config);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, resp.data);
  return destPath;
}

async function createMagentoProduct(product, categoryIds) {
  const description = buildSpecsTable(product.specifications);
  const customAttributes = [
    { attribute_code: 'description', value: description },
    { attribute_code: 'short_description', value: description },
    { attribute_code: 'url_key', value: product.urlKey },
    { attribute_code: 'category_ids', value: categoryIds },
  ];

  const payload = {
    product: {
      sku: product.sku,
      name: product.title,
      attribute_set_id: 4,
      price: 0,
      status: 1,
      visibility: 4,
      type_id: 'simple',
      weight: 0,
      custom_attributes: customAttributes,
    },
  };

  try {
    const res = await axios.post(`${API_BASE}products`, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return { success: true, status: res.status, productId: res.data?.id };
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
    return { success: false, status: response?.status, error: formattedMessage };
  }
}

async function uploadImage(sku, filePath, position, isMain) {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const base64 = buffer.toString('base64');

  const payload = {
    entry: {
      media_type: 'image',
      label: `${sku} image ${position}`,
      position,
      disabled: false,
      types: isMain ? ['image', 'small_image', 'thumbnail'] : [],
      file: fileName,
      content: {
        base64_encoded_data: base64,
        type: mimeTypeFromExt(path.extname(filePath)),
        name: fileName,
      },
    },
  };

  try {
    const res = await axios.post(`${API_BASE}products/${encodeURIComponent(sku)}/media`, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
    return { success: true, entryId: res.data?.id };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || err.message };
  }
}

async function fixImageExtensions(imageDir) {
  const files = fs.readdirSync(imageDir).filter(f => fs.statSync(path.join(imageDir, f)).isFile());
  for (const file of files) {
    const filePath = path.join(imageDir, file);
    const buffer = fs.readFileSync(filePath);
    const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPng = buffer.toString('ascii', 0, 4) === '\x89PNG';

    if (file.endsWith('.png') && isJpg) {
      fs.renameSync(filePath, path.join(imageDir, file.replace(/\.png$/, '.jpg')));
    }
  }
}

async function main() {
  const fetcher = await createFetcher({ proxy: PROXY });

  try {
    for (const job of PRODUCTS) {
      console.log(`\n=== ${job.folder} ===`);

      // Fetch and parse product page
      console.log(`Fetching ${job.url}`);
      const { html } = await fetcher.fetchPage(job.url, { postLoadDelay: 3000 });
      const product = parseProduct(html, job.url);
      console.log(`Parsed: ${product.title} / SKU: ${product.sku}`);

      // Save scraped data locally
      const outDir = path.join(PROJECT_ROOT, 'public', 'atlas-scrape', job.folder);
      const imageDir = path.join(outDir, 'images', product.sku || sanitizeFilename(product.urlKey));
      fs.mkdirSync(outDir, { recursive: true });
      fs.mkdirSync(imageDir, { recursive: true });

      const data = {
        ...product,
        categoryFolder: job.folder,
        sourceListingUrl: job.url,
        productUrl: job.url,
        localImages: [],
        magento: {
          sku: product.sku,
          name: product.title,
          attributeSetId: 4,
          price: 0,
          weight: 0,
          description: buildSpecsTable(product.specifications),
          urlKey: product.urlKey,
          categoryIds: job.categoryIds,
          status: 1,
          visibility: 4,
          typeId: 'simple',
        },
      };

      // Download images
      console.log(`Downloading ${product.images.length} image(s)...`);
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        const ext = path.extname(new URL(imageUrl).pathname.split('?')[0]) || '.jpg';
        const filename = `${String(i).padStart(2, '0')}${ext}`;
        const destPath = path.join(imageDir, filename);
        try {
          await downloadImage(imageUrl, destPath);
          data.localImages.push('/' + path.relative(PROJECT_ROOT, destPath).replace(/\\/g, '/'));
        } catch (err) {
          console.error(`  download failed: ${imageUrl}`, err.message);
        }
      }

      // Fix extensions
      await fixImageExtensions(imageDir);

      // Rebuild localImages after extension fix
      data.localImages = fs.readdirSync(imageDir)
        .filter(f => fs.statSync(path.join(imageDir, f)).isFile())
        .sort()
        .map(f => '/' + path.relative(PROJECT_ROOT, path.join(imageDir, f)).replace(/\\/g, '/'));

      fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify([data], null, 2));

      // Create Magento product
      console.log('Creating Magento product...');
      const createResult = await createMagentoProduct(product, job.categoryIds);
      if (!createResult.success) {
        console.error(`  FAILED: ${createResult.error}`);
        continue;
      }
      console.log(`  created id=${createResult.productId}`);

      // Upload images
      console.log('Uploading images...');
      const imageFiles = fs.readdirSync(imageDir).filter(f => fs.statSync(path.join(imageDir, f)).isFile()).sort();
      for (let i = 0; i < imageFiles.length; i++) {
        const result = await uploadImage(product.sku, path.join(imageDir, imageFiles[i]), i + 1, i === 0);
        if (result.success) {
          console.log(`  uploaded ${imageFiles[i]}`);
        } else {
          console.error(`  failed ${imageFiles[i]}: ${result.error}`);
        }
        if (i < imageFiles.length - 1) await sleep(500);
      }

      await sleep(2000);
    }
  } finally {
    await fetcher.close();
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
