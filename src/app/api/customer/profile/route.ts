import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest) {
  try {
    const customerToken = req.headers.get("x-customer-token");
    if (!customerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${API_BASE}customers/me`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to fetch profile" }));
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/customer/profile GET]", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customerToken = req.headers.get("x-customer-token");
    if (!customerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(`${API_BASE}customers/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to update profile" }));
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/customer/profile PUT]", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
