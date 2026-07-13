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
    default:
      return 'image/jpeg';
  }
}

async function deleteMediaEntry(sku, entryId) {
  try {
    await axios.delete(`${API_BASE}products/${encodeURIComponent(sku)}/media/${entryId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 30000,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || err.message };
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

async function main() {
  const skus = fs.readdirSync(IMAGE_DIR).filter(name => fs.statSync(path.join(IMAGE_DIR, name)).isDirectory());

  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i];
    console.log(`\n[${i + 1}/${skus.length}] ${sku}`);

    // Step 1: Get current media and delete all
    const productRes = await axios.get(`${API_BASE}products/${encodeURIComponent(sku)}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 30000,
    });

    const entries = productRes.data.media_gallery_entries || [];
    console.log(`  deleting ${entries.length} existing media entries...`);

    for (const entry of entries) {
      const result = await deleteMediaEntry(sku, entry.id);
      if (result.success) {
        console.log(`    deleted entry ${entry.id}`);
      } else {
        console.error(`    failed to delete entry ${entry.id}: ${result.error}`);
      }
      await sleep(300);
    }

    // Step 2: Upload local images fresh
    const dir = path.join(IMAGE_DIR, sku);
    const files = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile()).sort();
    console.log(`  uploading ${files.length} images...`);

    for (let j = 0; j < files.length; j++) {
      const result = await uploadImage(sku, path.join(dir, files[j]), j + 1, j === 0);
      if (result.success) {
        console.log(`    uploaded ${files[j]}`);
      } else {
        console.error(`    failed ${files[j]}: ${result.error}`);
      }
      if (j < files.length - 1) await sleep(500);
    }

    if (i < skus.length - 1) await sleep(1000);
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
