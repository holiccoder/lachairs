"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerOrders,
  type CustomerProfile,
  type CustomerOrder,
} from "@/lib/magento";

type Tab = "profile" | "orders";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "profile" || tabParam === "orders") {
      setTab(tabParam);
    }
  }, []);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editForm, setEditForm] = useState({
    firstname: auth.firstName || "",
    lastname: auth.lastName || "",
    email: auth.email || "",
  });

  const fetchData = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    const [p, o] = await Promise.all([
      getCustomerProfile(auth.token),
      getCustomerOrders(auth.token),
    ]);
    if (p) {
      setProfile(p);
      setEditForm({ firstname: p.firstname, lastname: p.lastname, email: p.email });
    }
    setOrders(o);
    setLoading(false);
  }, [auth.token]);

  useEffect(() => {
    if (!auth.hydrated) {
      return;
    }

    if (!auth.isLoggedIn) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [auth.hydrated, auth.isLoggedIn, auth.token, router, fetchData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token) return;
    setSaving(true);
    setSaveMsg(null);
    const ok = await updateCustomerProfile(auth.token, editForm);
    if (ok) {
      setSaveMsg({ type: "success", text: "Profile updated successfully." });
      localStorage.setItem("customer_email", editForm.email);
      localStorage.setItem("customer_firstname", editForm.firstname);
      localStorage.setItem("customer_lastname", editForm.lastname);
    } else {
      setSaveMsg({ type: "error", text: "Failed to update profile. Please try again." });
    }
    setSaving(false);
  };

  if (!auth.hydrated || !auth.isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-heading mb-8">My Account</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setTab("profile")}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left ${
                  tab === "profile"
                    ? "bg-brand text-white"
                    : "text-heading hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setTab("orders")}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left ${
                  tab === "orders"
                    ? "bg-brand text-white"
                    : "text-heading hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="2" width="18" height="4" rx="1" />
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                  <rect x="3" y="16" width="18" height="4" rx="1" />
                </svg>
                Orders
              </button>
              <button
                onClick={() => {
                  auth.logout();
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3" strokeLinecap="round" />
                </svg>
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-body mt-4">Loading...</p>
              </div>
            ) : tab === "profile" ? (
              <div className="bg-white rounded-lg border border-gray-100 p-6 lg:p-8">
                <h2 className="text-lg font-bold text-heading mb-2">Profile Details</h2>
                <p className="text-sm text-body mb-6">
                  Welcome, <span className="font-semibold text-heading">{editForm.firstname} {editForm.lastname}</span>
                </p>

                {saveMsg && (
                  <div
                    className={`text-sm px-4 py-3 rounded mb-6 ${
                      saveMsg.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {saveMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstname}
                      onChange={(e) => setEditForm((p) => ({ ...p, firstname: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastname}
                      onChange={(e) => setEditForm((p) => ({ ...p, lastname: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>

                  {profile?.addresses?.length ? (
                    <div>
                      <h3 className="text-sm font-semibold text-heading mb-2 mt-6">Default Address</h3>
                      {profile.addresses.filter((a) => a.default_billing || a.default_shipping).map((addr) => (
                        <div key={addr.id} className="text-sm text-body bg-gray-50 rounded p-4 space-y-0.5">
                          <p className="font-medium text-heading">
                            {addr.firstname} {addr.lastname}
                          </p>
                          <p>{addr.street.join(", ")}</p>
                          <p>
                            {addr.city}, {addr.region.region_code} {addr.postcode}
                          </p>
                          <p>{addr.telephone}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-2.5 rounded transition-colors"
                  >
                    {saving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-100 p-6 lg:p-8">
                <h2 className="text-lg font-bold text-heading mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="2" width="18" height="4" rx="1" />
                      <rect x="3" y="9" width="18" height="4" rx="1" />
                      <rect x="3" y="16" width="18" height="4" rx="1" />
                    </svg>
                    <p className="text-sm text-body">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-heading text-xs uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-heading text-xs uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-heading text-xs uppercase tracking-wider">
                            Items
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-heading text-xs uppercase tracking-wider">
                            Total
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-heading text-xs uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.entity_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 text-heading font-medium">
                              #{order.increment_id}
                            </td>
                            <td className="py-3 px-4 text-body">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-4 text-body">{order.total_item_count}</td>
                            <td className="py-3 px-4 text-heading font-medium">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: order.order_currency_code || "USD",
                              }).format(order.grand_total)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                  order.status === "complete"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : order.status === "canceled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
