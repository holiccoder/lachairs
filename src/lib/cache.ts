/* -------------------------------------------------------------------------- */
/*  File-based Stale-While-Revalidate Cache for Magento API responses           */
/*                                                                              */
/*  Strategy:                                                                   */
/*   1. Try the live fetch.                                                     */
/*   2. On success → write to disk, return fresh data.                          */
/*   3. On failure → read last-good cache from disk, return stale data.         */
/*   4. No cache + failure → re-throw (nothing we can do).                      */
/*                                                                              */
/*  Cache entries never expire. They are only replaced by a newer successful    */
/*  fetch. This means the app degrades gracefully during backend outages.       */
/* -------------------------------------------------------------------------- */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const CACHE_DIR = path.join(process.cwd(), ".data-cache");

interface CacheEntry<T> {
  data: T;
  timestamp: number; // Date.now() when this entry was written
  key: string;       // original cache key (for debugging)
}

function slugify(key: string): string {
  // Replace URL-special chars, truncate, and append a short hash for uniqueness
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 12);
  return `${safe}_${hash}.json`;
}

async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // Directory already exists — fine
  }
}

async function readCache<T>(filename: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, filename), "utf-8");
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.timestamp !== "number" || entry.data === undefined) {
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

async function writeCache<T>(filename: string, entry: CacheEntry<T>): Promise<void> {
  await ensureCacheDir();
  const tmp = path.join(CACHE_DIR, `${filename}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(entry, null, 2), "utf-8");
  await fs.rename(tmp, path.join(CACHE_DIR, filename));
}

export interface StaleResult<T> {
  data: T;
  stale: boolean;
  cachedAt: number | null; // Date.now() when the cache was written, null if fresh
}

/**
 * Fetch with stale-while-revalidate semantics.
 *
 * @param key       A unique key for this resource (e.g. the API URL path).
 * @param fetcher   An async function that returns the fresh data.
 * @returns         The data, plus a `stale` flag and `cachedAt` timestamp.
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<StaleResult<T>> {
  const filename = slugify(key);

  try {
    const data = await fetcher();

    // Write successful response to cache (fire-and-forget — don't block return)
    writeCache(filename, { data, timestamp: Date.now(), key }).catch(() => {});

    return { data, stale: false, cachedAt: null };
  } catch (fetchError) {
    // Backend is down — try the cache
    const entry = await readCache<T>(filename);

    if (entry) {
      console.warn(
        `[cache] Backend unreachable for "${key}", serving stale data from ${new Date(entry.timestamp).toISOString()}`,
      );
      return { data: entry.data, stale: true, cachedAt: entry.timestamp };
    }

    // No cache to fall back on — re-throw the original error
    throw fetchError;
  }
}
