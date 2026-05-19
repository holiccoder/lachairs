import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const customerToken = req.headers.get("x-customer-token");
    if (!customerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      items: { sku: string; qty: number }[];
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
    };

    if (!body.items?.length) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const authHeaders = {
      Authorization: `Bearer ${customerToken}`,
      "Content-Type": "application/json",
    };

    // Step 1: Create cart
    const cartRes = await fetch(`${API_BASE}carts/mine`, {
      method: "POST",
      headers: authHeaders,
    });
    if (!cartRes.ok) {
      const err = await cartRes.json().catch(() => ({ message: "Failed to create cart" }));
      return NextResponse.json({ error: err.message }, { status: cartRes.status });
    }
    const cartId = await cartRes.json();
    const quoteId = typeof cartId === "string" ? cartId : String(cartId);

    // Step 2: Add items
    for (const item of body.items) {
      const itemRes = await fetch(`${API_BASE}carts/mine/items`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          cartItem: {
            sku: item.sku,
            qty: item.qty,
            quote_id: quoteId,
          },
        }),
      });
      if (!itemRes.ok) {
        const err = await itemRes.json().catch(() => ({ message: "Failed to add item" }));
        return NextResponse.json({ error: err.message }, { status: itemRes.status });
      }
    }

    // Step 3: Set shipping information
    const addr = body.shippingAddress;
    const shipRes = await fetch(`${API_BASE}carts/mine/shipping-information`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        addressInformation: {
          shipping_address: {
            firstname: addr.firstname,
            lastname: addr.lastname,
            street: addr.street,
            city: addr.city,
            region: addr.region_code,
            region_id: 0,
            postcode: addr.postcode,
            country_id: addr.country_id,
            telephone: addr.telephone,
          },
          billing_address: {
            firstname: addr.firstname,
            lastname: addr.lastname,
            street: addr.street,
            city: addr.city,
            region: addr.region_code,
            region_id: 0,
            postcode: addr.postcode,
            country_id: addr.country_id,
            telephone: addr.telephone,
          },
          shipping_method_code: "flatrate",
          shipping_carrier_code: "flatrate",
        },
      }),
    });
    if (!shipRes.ok) {
      const err = await shipRes.json().catch(() => ({ message: "Failed to set shipping" }));
      return NextResponse.json({ error: err.message }, { status: shipRes.status });
    }

    // Step 4: Place order
    const orderRes = await fetch(`${API_BASE}carts/mine/order`, {
      method: "PUT",
      headers: authHeaders,
    });
    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({ message: "Failed to place order" }));
      return NextResponse.json({ error: err.message }, { status: orderRes.status });
    }

    const orderId = await orderRes.json();
    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("[/api/checkout]", err);
    return NextResponse.json({ error: "Network error. Please try again." }, { status: 502 });
  }
}
