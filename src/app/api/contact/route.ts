import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const MESSAGES_DIR = path.join(process.cwd(), "data", "contact-messages");

interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: string;
  message: string;
}

function isValid(body: unknown): body is ContactSubmission {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.firstName === "string" && b.firstName.trim().length > 0 &&
    typeof b.lastName === "string" && b.lastName.trim().length > 0 &&
    typeof b.email === "string" && b.email.includes("@") &&
    typeof b.inquiryType === "string" && b.inquiryType.trim().length > 0 &&
    typeof b.message === "string" && b.message.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValid(body)) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const now = new Date();
    const record = {
      submittedAt: now.toISOString(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || "",
      company: body.company?.trim() || "",
      inquiryType: body.inquiryType.trim(),
      message: body.message.trim(),
    };

    await fs.mkdir(MESSAGES_DIR, { recursive: true });

    const stamp = now.toISOString().replace(/[:.]/g, "-");
    const safeEmail = record.email.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${stamp}_${safeEmail}.json`;

    await fs.writeFile(
      path.join(MESSAGES_DIR, filename),
      JSON.stringify(record, null, 2),
      "utf-8",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] submission failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
