"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  adminLogin,
  clearAdminToken,
  createProduct,
  getAdminToken,
  setAdminToken,
  type CreateProductPayload,
} from "@/lib/magento-admin";

type Notice = {
  type: "success" | "error";
  text: string;
};

type ProductForm = {
  sku: string;
  name: string;
  attributeSetId: string;
  price: string;
  weight: string;
  description: string;
  urlKey: string;
  categoryIds: string;
  status: string;
  visibility: string;
};

const initialProductForm: ProductForm = {
  sku: "",
  name: "",
  attributeSetId: "4",
  price: "",
  weight: "0",
  description: "",
  urlKey: "",
  categoryIds: "",
  status: "1",
  visibility: "4",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fieldClass() {
  return "w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors";
}

export default function NewProductAdminPage() {
  const [hydrated, setHydrated] = useState(false);
  const [adminToken, setAdminTokenState] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [urlKeyEdited, setUrlKeyEdited] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialProductForm);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAdminTokenState(getAdminToken());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const parsedCategoryIds = useMemo(
    () =>
      form.categoryIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    [form.categoryIds]
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setNotice(null);

    const result = await adminLogin(password);

    if (result.success && result.token) {
      setAdminToken(result.token);
      setAdminTokenState(result.token);
      setPassword("");
      setNotice(null);
    } else {
      setNotice({ type: "error", text: result.error || "Admin login failed." });
    }

    setLoginLoading(false);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      urlKey: urlKeyEdited ? prev.urlKey : slugify(name),
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!adminToken) {
      setNotice({ type: "error", text: "Please sign in as an admin first." });
      return;
    }

    setCreating(true);
    setNotice(null);

    const payload: CreateProductPayload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      attributeSetId: Number(form.attributeSetId),
      price: Number(form.price),
      weight: Number(form.weight),
      description: form.description.trim(),
      urlKey: form.urlKey.trim(),
      categoryIds: parsedCategoryIds,
      status: Number(form.status),
      visibility: Number(form.visibility),
      typeId: "simple",
    };

    const result = await createProduct(adminToken, payload);

    if (result.success) {
      setNotice({
        type: "success",
        text: `Product ${result.sku || payload.sku} created successfully${
          result.productId ? ` (ID ${result.productId})` : ""
        }.` ,
      });
      setForm(initialProductForm);
      setUrlKeyEdited(false);
    } else {
      setNotice({ type: "error", text: result.error || "Failed to create product." });
    }

    setCreating(false);
  };

  const handleSignOut = () => {
    clearAdminToken();
    setAdminTokenState(null);
    setNotice(null);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
        <Header />
        <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full flex-1">
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-body mt-4">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Header />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase mb-2">
              Magento Admin
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-heading">
              Add Product
            </h1>
            <p className="text-sm text-body mt-2">
              Create a simple product in the Magento backend.
            </p>
          </div>

          {adminToken ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="self-start md:self-auto text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          ) : null}
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 lg:p-8 max-w-3xl">
          {notice && (
            <div
              className={`text-sm px-4 py-3 rounded mb-6 ${
                notice.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {notice.text}
            </div>
          )}

          {!adminToken ? (
            <form onSubmit={handleLogin} className="space-y-5 max-w-md">
              <div>
                <h2 className="text-lg font-bold text-heading mb-2">Admin Login</h2>
                <p className="text-sm text-body mb-6">
                  Enter the admin password configured in the server environment.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass()}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-2.5 rounded transition-colors"
              >
                {loginLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-heading mb-2">Product Details</h2>
                <p className="text-sm text-body">
                  Required Magento fields are marked by the browser validation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className={fieldClass()}
                    placeholder="chair-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={fieldClass()}
                    placeholder="Conference Chair"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Attribute Set ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.attributeSetId}
                    onChange={(e) => setForm((p) => ({ ...p, attributeSetId: e.target.value }))}
                    className={fieldClass()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className={fieldClass()}
                    placeholder="199.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Weight
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                    className={fieldClass()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    URL Key
                  </label>
                  <input
                    type="text"
                    value={form.urlKey}
                    onChange={(e) => {
                      setUrlKeyEdited(true);
                      setForm((p) => ({ ...p, urlKey: e.target.value }));
                    }}
                    className={fieldClass()}
                    placeholder="conference-chair"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className={fieldClass()}
                  >
                    <option value="1">Enabled</option>
                    <option value="2">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}
                    className={fieldClass()}
                  >
                    <option value="4">Catalog, Search</option>
                    <option value="2">Catalog</option>
                    <option value="3">Search</option>
                    <option value="1">Not Visible Individually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-1.5">
                  Category IDs
                </label>
                <input
                  type="text"
                  value={form.categoryIds}
                  onChange={(e) => setForm((p) => ({ ...p, categoryIds: e.target.value }))}
                  className={fieldClass()}
                  placeholder="2, 15, 27"
                />
                <p className="text-xs text-body mt-1.5">
                  Optional. Enter Magento category IDs separated by commas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={`${fieldClass()} min-h-32 resize-y`}
                  placeholder="Product description"
                />
              </div>

              <div className="bg-gray-50 rounded p-4 text-xs text-body space-y-1">
                <p>
                  <span className="font-semibold text-heading">Product type:</span> Simple
                </p>
                <p>
                  <span className="font-semibold text-heading">Categories:</span>{" "}
                  {parsedCategoryIds.length ? parsedCategoryIds.join(", ") : "None"}
                </p>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-2.5 rounded transition-colors"
              >
                {creating ? "CREATING PRODUCT..." : "CREATE PRODUCT"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
