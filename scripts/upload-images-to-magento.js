const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT_FILE = path.join(PROJECT_ROOT, 'public', 'atlas-scrape', 'all-products.json');
const REPORT_FILE = path.join(PROJECT_ROOT, 'public', 'atlas-scrape', 'magento-image-upload-report.json');

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

async function uploadImage(sku, filePath, position, isMain) {
  const absolutePath = path.join(PROJECT_ROOT, filePath.replace(/^\//, ''));
  if (!fs.existsSync(absolutePath)) {
    return { success: false, error: `File not found: ${absolutePath}` };
  }

  const buffer = fs.readFileSync(absolutePath);
  const ext = path.extname(absolutePath);
  const fileName = path.basename(absolutePath);
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

    return {
      success: true,
      entryId: res.data?.id,
      file: fileName,
      position,
    };
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

    return {
      success: false,
      file: fileName,
      error: formattedMessage,
      status: response?.status,
    };
  }
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Input file not found:', INPUT_FILE);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Starting image upload for ${products.length} products\n`);

  const results = [];
  let totalImages = 0;
  let successImages = 0;
  let failedImages = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const sku = product.sku || product.magento?.sku;
    const localImages = product.localImages || [];

    console.log(`[${i + 1}/${products.length}] ${sku} — ${localImages.length} image(s)`);

    const productResult = {
      sku,
      productUrl: product.productUrl,
      images: [],
    };

    for (let j = 0; j < localImages.length; j++) {
      const filePath = localImages[j];
      totalImages++;
      const result = await uploadImage(sku, filePath, j + 1, j === 0);
      productResult.images.push({ file: filePath, ...result });

      if (result.success) {
        successImages++;
      } else {
        failedImages++;
        console.error(`  FAILED ${filePath}: ${result.error}`);
      }

      if (j < localImages.length - 1) {
        await sleep(500);
      }
    }

    results.push(productResult);

    if (i < products.length - 1) {
      await sleep(1000);
    }
  }

  const report = {
    time: new Date().toISOString(),
    apiBase: API_BASE,
    totalProducts: products.length,
    totalImages,
    successfulImages: successImages,
    failedImages,
    results,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log('\n=== Image Upload Summary ===');
  console.log(`Products: ${report.totalProducts}`);
  console.log(`Total images: ${report.totalImages}`);
  console.log(`Successful: ${report.successfulImages}`);
  console.log(`Failed: ${report.failedImages}`);
  console.log(`\nReport saved to: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
