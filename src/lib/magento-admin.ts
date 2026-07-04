/* -------------------------------------------------------------------------- */
/*  Client-safe Magento admin API functions (no Node.js builtins)              */
/* -------------------------------------------------------------------------- */

const ADMIN_TOKEN_KEY = "admin_token";

export interface AdminLoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  attributeSetId: number;
  price: number;
  weight: number;
  description: string;
  urlKey: string;
  categoryIds: string[];
  status: number;
  visibility: number;
  typeId: "simple";
}

export interface CreateProductResult {
  success: boolean;
  productId?: number;
  sku?: string;
  error?: string;
}

export async function adminLogin(password: string): Promise<AdminLoginResult> {
  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({ error: "Admin login failed" }));

    if (!res.ok) {
      return { success: false, error: data.error || "Admin login failed" };
    }

    if (typeof data?.token !== "string" || !data.token) {
      return { success: false, error: "Admin login response did not include a token." };
    }

    return { success: true, token: data.token };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload
): Promise<CreateProductResult> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "x-admin-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ error: "Failed to create product" }));

    if (!res.ok) {
      return { success: false, error: data.error || "Failed to create product" };
    }

    return {
      success: true,
      productId: typeof data?.id === "number" ? data.id : undefined,
      sku: typeof data?.sku === "string" ? data.sku : payload.sku,
    };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
