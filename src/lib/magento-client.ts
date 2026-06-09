/* -------------------------------------------------------------------------- */
/*  Client-safe Magento API functions (no Node.js builtins)                     */
/* -------------------------------------------------------------------------- */

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
