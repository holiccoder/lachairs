import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest) {
  try {
    const customerToken = req.headers.get("x-customer-token");
    if (!customerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = `${API_BASE}orders?searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC&searchCriteria[pageSize]=50`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to fetch orders" }));
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/customer/orders GET]", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
