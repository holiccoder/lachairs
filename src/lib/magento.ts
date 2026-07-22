/* -------------------------------------------------------------------------- */
/*  Magento 2 REST API Client                                                  */
/* -------------------------------------------------------------------------- */

import { staleWhileRevalidate } from "./cache";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const MEDIA_BASE = "https://admin.lachairs.com/media/catalog/product";

/* -------------------------------------------------------------------------- */
/*  Raw Magento API Types                                                      */
/* -------------------------------------------------------------------------- */

interface MagentoMediaEntry {
  id: number;
  media_type: string;
  label: string | null;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

interface MagentoCustomAttribute {
  attribute_code: string;
  value: string | string[];
}

interface MagentoCategoryLink {
  position: number;
  category_id: string;
}

interface MagentoConfigOption {
  id: number;
  attribute_id: string;
  label: string;
  position: number;
  values: { value_index: number }[];
  product_id: number;
}

interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  attribute_set_id: number;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: {
    website_ids: number[];
    category_links: MagentoCategoryLink[];
    configurable_product_options?: MagentoConfigOption[];
    configurable_product_links?: number[];
  };
  product_links: unknown[];
  options: unknown[];
  media_gallery_entries: MagentoMediaEntry[];
  tier_prices: unknown[];
  custom_attributes: MagentoCustomAttribute[];
}

interface MagentoProductsResponse {
  items: MagentoProduct[];
  search_criteria: {
    filter_groups: unknown[];
    page_size: number;
    current_page: number;
  };
  total_count: number;
}

interface MagentoCategoryCustomAttribute {
  attribute_code: string;
  value: string;
}

interface MagentoCategory {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: MagentoCategory[];
  custom_attributes?: MagentoCategoryCustomAttribute[];
}

function catAttr(cat: MagentoCategory, code: string): string {
  if (!cat.custom_attributes) return "";
  const a = cat.custom_attributes.find((c) => c.attribute_code === code);
  return a ? a.value : "";
}

export interface Category {
  id: number;
  parentId: number;
  name: string;
  level: number;
  productCount: number;
  urlKey: string;
  urlPath: string;
  children: Category[];
}

/* -------------------------------------------------------------------------- */
/*  Clean Product Type (used by UI)                                            */
/* -------------------------------------------------------------------------- */

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  typeId: string;
  weight: number;
  status: number;
  images: { file: string; url: string; types: string[] }[];
  thumbnail: string;
  description: string;
  urlKey: string;
  categoryIds: string[];
  metaTitle: string;
  metaDescription: string;
  color: string;
  countryOfManufacture: string;
  hasOptions: boolean;
  configurableOptions?: MagentoConfigOption[];
  configurableLinks?: number[];
}

export interface ProductsResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function attr(product: MagentoProduct, code: string): string {
  const a = product.custom_attributes.find((c) => c.attribute_code === code);
  if (!a) return "";
  return Array.isArray(a.value) ? a.value.join(",") : String(a.value);
}

function imageUrl(file: string): string {
  // Remove cache hash path (e.g., /cache/100x100/abc123.jpg -> /abc123.jpg)
  // to get the original full-size image
  const cleanPath = file.replace(/^\/cache\/[^/]+\//, '/');
  return `${MEDIA_BASE}${cleanPath}`;
}

function findThumbnail(entries: MagentoMediaEntry[]): string {
  const thumb = entries.find(
    (e) => e.types.includes("thumbnail") || e.types.includes("image")
  );
  return thumb ? imageUrl(thumb.file) : "";
}

function transformProduct(p: MagentoProduct): Product {
  const images = p.media_gallery_entries.map((e) => ({
    file: e.file,
    url: imageUrl(e.file),
    types: e.types,
  }));

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: p.price,
    typeId: p.type_id,
    weight: p.weight,
    status: p.status,
    images,
    thumbnail: findThumbnail(p.media_gallery_entries),
    description: attr(p, "description"),
    urlKey: attr(p, "url_key"),
    categoryIds: Array.isArray(attr(p, "category_ids"))
      ? (attr(p, "category_ids") as unknown as string[])
      : attr(p, "category_ids")
          .split(",")
          .filter(Boolean),
    metaTitle: attr(p, "meta_title"),
    metaDescription: attr(p, "meta_description"),
    color: attr(p, "color"),
    countryOfManufacture: attr(p, "country_of_manufacture"),
    hasOptions: attr(p, "has_options") === "1",
    configurableOptions: p.extension_attributes.configurable_product_options,
    configurableLinks: p.extension_attributes.configurable_product_links,
  };
}

/* -------------------------------------------------------------------------- */
/*  API Functions                                                              */
/* -------------------------------------------------------------------------- */

async function magentoFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const result = await staleWhileRevalidate<T>(path, async () => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Magento API error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  });

  return result.data;
}

export async function getProducts(
  page = 1,
  pageSize = 12
): Promise<ProductsResult> {
  try {
    const data = await magentoFetch<MagentoProductsResponse>(
      `products?searchCriteria[filter_groups][0][filters][0][field]=status&searchCriteria[filter_groups][0][filters][0][value]=1&searchCriteria[filter_groups][0][filters][0][condition_type]=eq&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
    );

    return {
      items: data.items.map(transformProduct),
      total: data.total_count,
      page,
      pageSize,
    };
  } catch (err) {
    console.error("[magento] getProducts failed:", err);
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  try {
    const product = await magentoFetch<MagentoProduct>(`products/${encodeURIComponent(sku)}`);
    if (product.status !== 1) return null;
    return transformProduct(product);
  } catch {
    return null;
  }
}

export async function getProductByUrlKey(urlKey: string): Promise<Product | null> {
  try {
    const filter = `searchCriteria[filter_groups][0][filters][0][field]=url_key&searchCriteria[filter_groups][0][filters][0][value]=${encodeURIComponent(urlKey)}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq&searchCriteria[filter_groups][1][filters][0][field]=status&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq`;
    const data = await magentoFetch<MagentoProductsResponse>(`products?${filter}`);
    if (data.items.length === 0) return null;
    return transformProduct(data.items[0]);
  } catch {
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const first = await getProducts(1, 100);
  return first.items;
}

export async function searchProducts(query: string, page = 1, pageSize = 24): Promise<ProductsResult> {
  try {
    const filter = `searchCriteria[filter_groups][0][filters][0][field]=name&searchCriteria[filter_groups][0][filters][0][value]=%25${encodeURIComponent(query)}%25&searchCriteria[filter_groups][0][filters][0][condition_type]=like&searchCriteria[filter_groups][1][filters][0][field]=status&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq`;
    const data = await magentoFetch<MagentoProductsResponse>(
      `products?${filter}&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
    );
    return {
      items: data.items.map(transformProduct),
      total: data.total_count,
      page,
      pageSize,
    };
  } catch (err) {
    console.error("[magento] searchProducts failed:", err);
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await magentoFetch<{
      children_data: MagentoCategory[];
    }>("categories");

    return data.children_data.map((cat) => transformCategory(cat, ""));
  } catch (err) {
    console.error("[magento] getCategories failed:", err);
    return [];
  }
}

function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function transformCategory(cat: MagentoCategory, parentPath = ""): Category {
  // Generate url_key from name if not available
  const rawUrlKey = catAttr(cat, "url_key");
  const urlKey = rawUrlKey || slugifyName(cat.name);

  // Build url_path: parentPath/urlKey for nested categories
  const rawUrlPath = catAttr(cat, "url_path");
  const urlPath = rawUrlPath || (parentPath ? `${parentPath}/${urlKey}` : urlKey);

  return {
    id: cat.id,
    parentId: cat.parent_id,
    name: cat.name,
    level: cat.level,
    productCount: cat.product_count,
    urlKey,
    urlPath,
    children: (cat.children_data || []).map((child) => transformCategory(child, urlPath)),
  };
}

/** Find a single category by its url_key (searches all levels) */
function findCategoryByUrlKey(
  categories: Category[],
  urlKey: string
): Category | null {
  for (const cat of categories) {
    if (cat.urlKey === urlKey) return cat;
    const found = findCategoryByUrlKey(cat.children, urlKey);
    if (found) return found;
  }
  return null;
}

export async function getCategoryByUrlKey(
  urlKey: string
): Promise<Category | null> {
  const categories = await getCategories();
  return findCategoryByUrlKey(categories, urlKey);
}

export async function getProductsByCategory(
  categoryId: number,
  page = 1,
  pageSize = 24
): Promise<ProductsResult> {
  try {
    const filter = `searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=${categoryId}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq&searchCriteria[filter_groups][1][filters][0][field]=status&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq`;
    const data = await magentoFetch<MagentoProductsResponse>(
      `products?${filter}&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
    );

    return {
      items: data.items.map(transformProduct),
      total: data.total_count,
      page,
      pageSize,
    };
  } catch (err) {
    console.error("[magento] getProductsByCategory failed:", err);
    return { items: [], total: 0, page, pageSize };
  }
}

export interface CategoryInfo {
  name: string;
  urlKey: string;
  urlPath: string;
}

/** Build a flat map of category ID → name, urlKey & urlPath from the tree */
function flattenCategories(cats: Category[], map: Map<string, CategoryInfo>) {
  for (const cat of cats) {
    map.set(String(cat.id), { name: cat.name, urlKey: cat.urlKey, urlPath: cat.urlPath });
    flattenCategories(cat.children, map);
  }
}

export async function getCategoryLookup(): Promise<Record<string, CategoryInfo>> {
  const map = new Map<string, CategoryInfo>();
  const categories = await getCategories();
  flattenCategories(categories, map);
  return Object.fromEntries(map);
}

/* -------------------------------------------------------------------------- */
/*  Client-safe exports are now in magento-client.ts to avoid pulling          */
/*  Node.js builtins (node:fs/promises via cache.ts) into the client bundle.   */
/* -------------------------------------------------------------------------- */
