/* -------------------------------------------------------------------------- */
/*  Magento 2 REST API Client                                                  */
/* -------------------------------------------------------------------------- */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const MEDIA_BASE = "https://lachairs.com/media/catalog/product";

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
  return `${MEDIA_BASE}${file}`;
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
}

export async function getProducts(
  page = 1,
  pageSize = 12
): Promise<ProductsResult> {
  const data = await magentoFetch<MagentoProductsResponse>(
    `products?searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
  );

  return {
    items: data.items.map(transformProduct),
    total: data.total_count,
    page,
    pageSize,
  };
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  try {
    const product = await magentoFetch<MagentoProduct>(`products/${encodeURIComponent(sku)}`);
    return transformProduct(product);
  } catch {
    return null;
  }
}

export async function getProductByUrlKey(urlKey: string): Promise<Product | null> {
  try {
    const filter = `searchCriteria[filter_groups][0][filters][0][field]=url_key&searchCriteria[filter_groups][0][filters][0][value]=${encodeURIComponent(urlKey)}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`;
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
  const filter = `searchCriteria[filter_groups][0][filters][0][field]=name&searchCriteria[filter_groups][0][filters][0][value]=%25${encodeURIComponent(query)}%25&searchCriteria[filter_groups][0][filters][0][condition_type]=like`;
  const data = await magentoFetch<MagentoProductsResponse>(
    `products?${filter}&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
  );
  return {
    items: data.items.map(transformProduct),
    total: data.total_count,
    page,
    pageSize,
  };
}

export async function getCategories(): Promise<Category[]> {
  const data = await magentoFetch<{
    children_data: MagentoCategory[];
  }>("categories");

  return data.children_data.map(transformCategory);
}

function transformCategory(cat: MagentoCategory): Category {
  return {
    id: cat.id,
    parentId: cat.parent_id,
    name: cat.name,
    level: cat.level,
    productCount: cat.product_count,
    urlKey: catAttr(cat, "url_key"),
    urlPath: catAttr(cat, "url_path"),
    children: (cat.children_data || []).map(transformCategory),
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
  const filter = `searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=${categoryId}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`;
  const data = await magentoFetch<MagentoProductsResponse>(
    `products?${filter}&searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${page}`
  );

  return {
    items: data.items.map(transformProduct),
    total: data.total_count,
    page,
    pageSize,
  };
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
/*  Customer Auth                                                              */
/* -------------------------------------------------------------------------- */

export interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const res = await fetch(`${API_BASE}integration/customer/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      return { success: false, error: err.message || "Login failed" };
    }

    const token = await res.json();
    return { success: true, token: typeof token === "string" ? token : String(token) };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
