import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;

type CreateProductRequest = {
  sku?: string;
  name?: string;
  attributeSetId?: number;
  price?: number;
  weight?: number;
  description?: string;
  urlKey?: string;
  categoryIds?: string[];
  status?: number;
  visibility?: number;
  typeId?: string;
};

type MagentoError = {
  message?: string;
  parameters?: string[] | Record<string, string>;
};

function formatMagentoError(data: MagentoError): string {
  if (!data.message) {
    return "Failed to create product";
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

function validateProduct(payload: CreateProductRequest): string | null {
  if (!payload.sku?.trim()) return "SKU is required.";
  if (!payload.name?.trim()) return "Name is required.";
  if (!Number.isFinite(payload.attributeSetId)) return "Attribute set ID is required.";
  if (!Number.isFinite(payload.price) || Number(payload.price) < 0) {
    return "Price must be a positive number.";
  }
  if (!Number.isFinite(payload.weight) || Number(payload.weight) < 0) {
    return "Weight must be a positive number.";
  }
  if (!Number.isFinite(payload.status)) return "Status is required.";
  if (!Number.isFinite(payload.visibility)) return "Visibility is required.";

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = req.headers.get("x-admin-token");

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password is not configured." },
        { status: 500 }
      );
    }

    if (!adminToken || adminToken !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!API_BASE || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Magento API credentials are not configured." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreateProductRequest;
    const validationError = validateProduct(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const customAttributes = [];

    if (body.description?.trim()) {
      customAttributes.push({
        attribute_code: "description",
        value: body.description.trim(),
      });
    }

    if (body.urlKey?.trim()) {
      customAttributes.push({
        attribute_code: "url_key",
        value: body.urlKey.trim(),
      });
    }

    const categoryIds = (body.categoryIds || [])
      .map((id) => id.trim())
      .filter(Boolean);

    if (categoryIds.length > 0) {
      customAttributes.push({
        attribute_code: "category_ids",
        value: categoryIds,
      });
    }

    const magentoPayload = {
      product: {
        sku: body.sku!.trim(),
        name: body.name!.trim(),
        attribute_set_id: Number(body.attributeSetId),
        price: Number(body.price),
        status: Number(body.status),
        visibility: Number(body.visibility),
        type_id: body.typeId || "simple",
        weight: Number(body.weight),
        custom_attributes: customAttributes,
      },
    };

    const res = await fetch(`${API_BASE}products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(magentoPayload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ message: "Failed to create product" }));

    if (!res.ok) {
      return NextResponse.json(
        { error: formatMagentoError(data) },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/products]", err);
    return NextResponse.json(
      { error: "Network error. Please try again." },
      { status: 502 }
    );
  }
}
