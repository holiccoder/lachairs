import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password is not configured." },
        { status: 500 }
      );
    }

    const { password } = (await req.json()) as { password?: string };

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    return NextResponse.json({ token: password }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/auth]", err);
    return NextResponse.json(
      { error: "Network error. Please try again." },
      { status: 502 }
    );
  }
}
