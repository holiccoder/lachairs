const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRAPE_ROOT = path.join(PROJECT_ROOT, 'public', 'atlas-scrape');

function detectFormat(buffer) {
  if (buffer.length < 8) return null;
  const header = buffer.slice(0, 8);
  if (header[0] === 0xFF && header[1] === 0xD8) return 'jpg';
  if (header.toString('ascii', 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (header.toString('ascii', 0, 6) === 'GIF87a' || header.toString('ascii', 0, 6) === 'GIF89a') return 'gif';
  return null;
}

function fixImageExtensions() {
  const categoryDirs = fs.readdirSync(SCRAPE_ROOT)
    .map(name => path.join(SCRAPE_ROOT, name))
    .filter(dir => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, 'images')));

  const renameMap = [];

  for (const categoryDir of categoryDirs) {
    const imagesDir = path.join(categoryDir, 'images');
    const productDirs = fs.readdirSync(imagesDir)
      .map(name => path.join(imagesDir, name))
      .filter(dir => fs.statSync(dir).isDirectory());

    for (const productDir of productDirs) {
      const files = fs.readdirSync(productDir).filter(f => fs.statSync(path.join(productDir, f)).isFile());
      for (const file of files) {
        const filePath = path.join(productDir, file);
        const buffer = fs.readFileSync(filePath);
        const actualExt = detectFormat(buffer);
        const currentExt = path.extname(file).slice(1).toLowerCase();

        if (!actualExt) {
          console.warn(`Unknown format: ${filePath}`);
          continue;
        }

        if (actualExt !== currentExt) {
          const baseName = path.basename(file, path.extname(file));
          const newFile = `${baseName}.${actualExt}`;
          const newPath = path.join(productDir, newFile);
          fs.renameSync(filePath, newPath);
          renameMap.push({ old: filePath, new: newPath });
          console.log(`Renamed ${file} → ${newFile}`);
        }
      }
    }
  }

  // Update JSON files
  const productsFiles = categoryDirs.map(dir => path.join(dir, 'products.json'));
  productsFiles.push(path.join(SCRAPE_ROOT, 'all-products.json'));

  for (const file of productsFiles) {
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let changed = false;

    const products = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(products)) continue;

    for (const product of products) {
      if (!product.localImages) continue;
      const newImages = product.localImages.map(imgPath => {
        const oldAbsolute = path.join(PROJECT_ROOT, imgPath.replace(/^\//, ''));
        const rename = renameMap.find(r => r.old === oldAbsolute);
        if (rename) {
          changed = true;
          const relative = path.relative(PROJECT_ROOT, rename.new).replace(/\\/g, '/');
          return '/' + relative;
        }
        return imgPath;
      });
      product.localImages = newImages;
    }

    if (changed) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`Updated ${file}`);
    }
  }

  console.log(`\nFixed ${renameMap.length} file extension(s).`);
}

fixImageExtensions();
