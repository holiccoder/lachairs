import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type MagentoLoginError = {
  message?: string;
  parameters?: string[] | Record<string, string>;
};

function formatMagentoError(data: MagentoLoginError): string {
  if (!data.message) {
    return "Login failed";
  }

  let message = data.message;

  if (Array.isArray(data.parameters)) {
    data.parameters.forEach((value, index) => {
      message = message.replaceAll(`%${index + 1}`, value);
    });
  } else if (data.parameters) {
    Object.entries(data.parameters).forEach(([key, value]) => {
      message = message.replaceAll(`%${key}`, value);
    });
  }

  return message;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}integration/customer/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ message: "Login failed" }));

    if (!res.ok) {
      return NextResponse.json(
        { error: formatMagentoError(data) },
        { status: res.status }
      );
    }

    const token = typeof data === "string" ? data : String(data ?? "");

    if (!token) {
      return NextResponse.json(
        { error: "Login response did not include a token." },
        { status: 502 }
      );
    }

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("[/api/login]", err);
    return NextResponse.json(
      { error: "Network error. Please try again." },
      { status: 502 }
    );
  }
}

