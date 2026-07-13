const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const PROXY = process.env.ATLAS_PROXY !== 'false' ? (process.env.ATLAS_PROXY || 'http://127.0.0.1:7890') : null;
const INPUT_FILE = path.join(__dirname, 'atlas-metal-folding-chairs.json');
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'atlas-scrape', 'metal-folding-chairs', 'images');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    case '.gif':
      return 'image/gif';
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

async function uploadImage(sku, filePath, position, isMain) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);
  const mimeType = mimeTypeFromExt(ext);
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
        type: mimeType,
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
    return { success: true, entryId: res.data?.id, file: fileName };
  } catch (err) {
    const response = err.response;
    const message = response?.data?.message || err.message;
    return { success: false, file: fileName, error: message, status: response?.status };
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  // Deduplicate by SKU, keep first occurrence
  const seen = new Map();
  products.forEach(p => {
    if (!seen.has(p.sku)) {
      seen.set(p.sku, p);
    }
  });
  const uniqueProducts = Array.from(seen.values());

  console.log(`Uploading images for ${uniqueProducts.length} unique products...\n`);

  const results = [];
  for (let i = 0; i < uniqueProducts.length; i++) {
    const p = uniqueProducts[i];
    const sku = p.sku;
    const productImageDir = path.join(IMAGE_DIR, sku);
    fs.mkdirSync(productImageDir, { recursive: true });

    console.log(`[${i + 1}/${uniqueProducts.length}] ${sku} — ${p.images.length} image(s)`);
    const productResult = { sku, images: [] };

    for (let j = 0; j < p.images.length; j++) {
      const imageUrl = p.images[j];
      const ext = path.extname(new URL(imageUrl).pathname.split('?')[0]) || '.jpg';
      const filename = `${String(j).padStart(2, '0')}${ext}`;
      const destPath = path.join(productImageDir, filename);

      try {
        await downloadImage(imageUrl, destPath);
        const uploadResult = await uploadImage(sku, destPath, j + 1, j === 0);
        productResult.images.push({ file: filename, ...uploadResult });

        if (!uploadResult.success) {
          console.error(`  FAILED upload ${filename}: ${uploadResult.error}`);
        }
      } catch (err) {
        console.error(`  FAILED download ${imageUrl}: ${err.message}`);
        productResult.images.push({ file: filename, success: false, error: err.message });
      }

      if (j < p.images.length - 1) {
        await sleep(500);
      }
    }

    results.push(productResult);

    if (i < uniqueProducts.length - 1) {
      await sleep(1000);
    }
  }

  const totalImages = results.reduce((sum, r) => sum + r.images.length, 0);
  const successfulImages = results.reduce((sum, r) => sum + r.images.filter(img => img.success).length, 0);

  console.log('\n=== Image Upload Summary ===');
  console.log(`Products: ${uniqueProducts.length}`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Successful: ${successfulImages}`);
  console.log(`Failed: ${totalImages - successfulImages}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
