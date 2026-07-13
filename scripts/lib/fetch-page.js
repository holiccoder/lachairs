const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createFetcher(options = {}) {
  const proxy = options.proxy !== undefined ? options.proxy : 'http://127.0.0.1:7890';
  const baseDelay = options.baseDelayMs || 2000;
  const delayJitter = options.delayJitterMs || 2000;
  const cacheDir = options.cacheDir || null;
  const retries = options.retries ?? 3;
  const timeout = options.timeout || 60000;

  const launchOptions = { headless: true };
  if (proxy) {
    launchOptions.proxy = { server: proxy };
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    userAgent: DEFAULT_USER_AGENT,
  });

  async function fetchPage(url, { cacheFile = null, postLoadDelay = 2000 } = {}) {
    if (cacheDir && cacheFile) {
      const fullCachePath = path.join(cacheDir, cacheFile);
      if (fs.existsSync(fullCachePath)) {
        console.log('  [cache hit]', cacheFile);
        return { html: fs.readFileSync(fullCachePath, 'utf8'), fromCache: true };
      }
    }

    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      const page = await context.newPage();
      try {
        if (attempt > 1) {
          const backoff = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
          console.log(`  retry ${attempt}/${retries} after ${backoff}ms`);
          await sleep(backoff);
        }
        console.log(`  fetching ${url}`);
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        if (resp.status() >= 400) {
          throw new Error(`HTTP ${resp.status()} for ${url}`);
        }
        await page.waitForTimeout(postLoadDelay);
        const html = await page.content();
        if (cacheDir && cacheFile) {
          const fullCachePath = path.join(cacheDir, cacheFile);
          fs.mkdirSync(path.dirname(fullCachePath), { recursive: true });
          fs.writeFileSync(fullCachePath, html);
        }
        return { html, fromCache: false };
      } catch (err) {
        lastError = err;
        console.error(`  attempt ${attempt} failed:`, err.message);
      } finally {
        await page.close();
      }
    }
    throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
  }

  async function close() {
    await browser.close();
  }

  return { fetchPage, close, sleep: (ms) => sleep(ms || randomBetween(baseDelay, baseDelay + delayJitter)) };
}

module.exports = { createFetcher, sleep, randomBetween };
