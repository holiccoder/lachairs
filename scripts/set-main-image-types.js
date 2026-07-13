const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lachairs.com/rest/V1/';
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'tkt0gu69u48e76eifvjp6wmw38sjlpxr';
const SKUS = ['MFC22', 'MFC22-FP', 'MFC22-VP', 'MFC22FP-2'];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  for (const sku of SKUS) {
    console.log(`\n${sku}`);

    const res = await axios.get(`${API_BASE}products/${encodeURIComponent(sku)}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 30000,
    });

    const entries = res.data.media_gallery_entries || [];
    if (entries.length === 0) {
      console.log('  no images');
      continue;
    }

    // Sort by position and pick the first one
    entries.sort((a, b) => a.position - b.position);
    const mainEntry = entries[0];

    try {
      await axios.put(`${API_BASE}products/${encodeURIComponent(sku)}/media/${mainEntry.id}`, {
        entry: {
          id: mainEntry.id,
          media_type: 'image',
          label: mainEntry.label,
          position: 1,
          disabled: false,
          types: ['image', 'small_image', 'thumbnail'],
          file: mainEntry.file,
        },
      }, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      console.log(`  set entry ${mainEntry.id} as main image`);
    } catch (err) {
      console.error(`  failed: ${err.response?.data?.message || err.message}`);
    }

    await sleep(500);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
