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

  return data.children_data.map((cat) => transformCategory(cat, ""));
}

function transformCategory(cat: MagentoCategory, parentPath = ""): Category {
  // Generate url_key from name if not available
  const rawUrlKey = catAttr(cat, "url_key");
  const urlKey = rawUrlKey || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
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
/*  B2B Company Registration                                                   */
/* -------------------------------------------------------------------------- */

export interface RegisterCompanyPayload {
  companyName: string;
  companyLegalName: string;
  businessType: string;
  vatTaxId: string;
  resellerId: string;
  streetAddress: string;
  streetAddress2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  jobTitle: string;
  adminEmail: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  customerId?: number;
  error?: string;
}

const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  Canada: "CA",
};

/**
 * Registers a new wholesale customer via POST /V1/customers.
 * Note: The Magento B2B Company module (Magento_Company) is not installed on
 * this store, so we fall back to standard customer creation and store company
 * details as custom_attributes.
 */
export async function registerCompany(
  payload: RegisterCompanyPayload
): Promise<RegisterResult> {
  const countryId = COUNTRY_CODES[payload.country] ?? "US";

  const body = {
    customer: {
      email: payload.adminEmail,
      firstname: payload.firstName,
      lastname: payload.lastName,
      addresses: [
        {
          firstname: payload.firstName,
          lastname: payload.lastName,
          street: [
            payload.streetAddress,
            ...(payload.streetAddress2 ? [payload.streetAddress2] : []),
          ],
          city: payload.city,
          region: { region_code: payload.state },
          postcode: payload.zip,
          country_id: countryId,
          telephone: payload.phone,
          default_billing: true,
          default_shipping: true,
        },
      ],
    },
    password: payload.password,
  };

  try {
    // Proxy through the Next.js route handler to avoid CORS issues with the
    // remote Magento origin when called from the browser.
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({ message: "Registration failed" }));

    if (!res.ok) {
      return { success: false, error: data.error || "Registration failed" };
    }

    if (typeof data?.id !== "number") {
      return {
        success: false,
        error: "Registration response did not include a customer ID.",
      };
    }

    return { success: true, customerId: data.id };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
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
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      return { success: false, error: err.error || "Login failed" };
    }

    const data = await res.json();

    if (typeof data?.token !== "string" || !data.token) {
      return { success: false, error: "Login response did not include a token." };
    }

    return { success: true, token: data.token };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

/* -------------------------------------------------------------------------- */
/*  Customer Profile & Orders (customer-token authenticated)                    */
/* -------------------------------------------------------------------------- */

export interface CustomerProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  addresses: {
    id: number;
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    region: { region_code: string; region: string };
    postcode: string;
    country_id: string;
    telephone: string;
    default_billing: boolean;
    default_shipping: boolean;
  }[];
}

export interface CustomerOrder {
  entity_id: number;
  increment_id: string;
  created_at: string;
  grand_total: number;
  status: string;
  order_currency_code: string;
  total_item_count: number;
  items: {
    name: string;
    sku: string;
    qty_ordered: number;
    price: number;
  }[];
}

async function customerFetch<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      "x-customer-token": token,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getCustomerProfile(token: string): Promise<CustomerProfile | null> {
  try {
    return await customerFetch<CustomerProfile>("/api/customer/profile", token);
  } catch {
    return null;
  }
}

export async function updateCustomerProfile(
  token: string,
  data: { firstname: string; lastname: string; email: string }
): Promise<boolean> {
  try {
    const body = {
      customer: {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
      },
    };
    await customerFetch("/api/customer/profile", token, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getCustomerOrders(token: string): Promise<CustomerOrder[]> {
  try {
    const data = await customerFetch<{ items: CustomerOrder[] }>(
      "/api/customer/orders",
      token
    );
    return data.items || [];
  } catch {
    return [];
  }
}

export interface PlaceOrderPayload {
  items: {
    sku: string;
    qty: number;
    selectedOptions?: { optionId: string; optionValue: number }[];
  }[];
  shippingAddress: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    region_code: string;
    postcode: string;
    country_id: string;
    telephone: string;
  };
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function placeOrder(
  token: string,
  payload: PlaceOrderPayload
): Promise<PlaceOrderResult> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "x-customer-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to place order" };
    }
    return { success: true, orderId: data.orderId };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
