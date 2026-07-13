const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
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
    default:
      return 'image/jpeg';
  }
}

async function uploadImage(sku, filePath, position, isMain) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
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
        type: mimeTypeFromExt(ext),
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

async function main() {
  const skus = fs.readdirSync(IMAGE_DIR).filter(name => fs.statSync(path.join(IMAGE_DIR, name)).isDirectory());
  console.log(`Re-uploading images for ${skus.length} products...\n`);

  let total = 0;
  let success = 0;

  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i];
    const dir = path.join(IMAGE_DIR, sku);
    const files = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile()).sort();

    // Only upload files that were renamed from png to jpg (or any remaining unuploaded)
    // We'll upload all .jpg files starting from position 1; Magento will append them.
    // To avoid duplicates, get current media gallery first.
    const currentRes = await axios.get(`${API_BASE}products/${encodeURIComponent(sku)}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 30000,
    }).catch(() => null);

    const existingFiles = new Set();
    if (currentRes) {
      currentRes.data.media_gallery_entries.forEach(e => {
        existingFiles.add(path.basename(e.file));
      });
    }

    console.log(`[${i + 1}/${skus.length}] ${sku} — existing: ${existingFiles.size}, local: ${files.length}`);

    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      if (existingFiles.has(file)) {
        console.log(`  skipping ${file} (already uploaded)`);
        continue;
      }

      total++;
      const result = await uploadImage(sku, path.join(dir, file), j + 1, j === 0);
      if (result.success) {
        success++;
        console.log(`  uploaded ${file}`);
      } else {
        console.error(`  FAILED ${file}: ${result.error}`);
      }

      if (j < files.length - 1) await sleep(500);
    }

    if (i < skus.length - 1) await sleep(1000);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Uploaded: ${success}/${total}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
