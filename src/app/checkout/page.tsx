"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { placeOrder, getCustomerProfile } from "@/lib/magento-client";

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CheckoutPage() {
  const router = useRouter();
  const auth = useAuth();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const [shipping, setShipping] = useState({
    firstname: auth.firstName || "",
    lastname: auth.lastName || "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.hydrated) return;
    if (!auth.isLoggedIn) {
      router.replace("/login");
    }
  }, [auth.hydrated, auth.isLoggedIn, router]);

  useEffect(() => {
    if (auth.hydrated && auth.isLoggedIn && items.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [auth.hydrated, auth.isLoggedIn, items.length, router, orderPlaced]);

  useEffect(() => {
    if (!auth.token) return;
    getCustomerProfile(auth.token).then((profile) => {
      if (!profile) return;
      const addr = profile.addresses?.find(
        (a) => a.default_shipping || a.default_billing
      ) || profile.addresses?.[0];
      if (!addr) return;
      setShipping({
        firstname: addr.firstname || auth.firstName || "",
        lastname: addr.lastname || auth.lastName || "",
        street: Array.isArray(addr.street) ? addr.street.join(", ") : (addr.street || ""),
        city: addr.city || "",
        state: addr.region?.region_code || "",
        zip: addr.postcode || "",
        phone: addr.telephone || "",
      });
    }).catch(() => {});
  }, [auth.token, auth.firstName, auth.lastName]);

  const handleField = (field: string, value: string) => {
    setShipping((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!auth.token) {
      setError("Please log in to continue.");
      setSubmitting(false);
      return;
    }

    const result = await placeOrder(auth.token, {
      items: items.map((i) => ({
        sku: i.sku,
        qty: i.quantity,
        selectedOptions: Object.entries(i.selectedOptions).map(([optionId, optionValue]) => ({
          optionId,
          optionValue,
        })),
      })),
      shippingAddress: {
        firstname: shipping.firstname,
        lastname: shipping.lastname,
        street: [shipping.street],
        city: shipping.city,
        region_code: shipping.state,
        postcode: shipping.zip,
        country_id: "US",
        telephone: shipping.phone,
      },
    });

    setSubmitting(false);

    if (result.success) {
      setOrderId(result.orderId ?? null);
      setOrderPlaced(true);
      clearCart();
    } else {
      setError(result.error || "Failed to place order. Please try again.");
    }
  };

  if (!auth.hydrated || !auth.isLoggedIn) return null;

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 w-full flex-1">
          <div className="max-w-lg mx-auto text-center">
            <svg viewBox="0 0 48 48" className="w-16 h-16 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="24" cy="24" r="20" />
              <path d="M14 24 L21 31 L34 17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-heading mb-4">
              Order Placed
            </h1>
            <p className="text-sm text-body mb-2">
              Thank you for your order. Our team will process it shortly.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-8">
                Order reference: <span className="font-mono font-semibold text-heading">{orderId}</span>
              </p>
            )}
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/dashboard?tab=orders"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3 rounded transition-colors"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="border border-gray-300 hover:border-heading text-heading font-semibold text-sm px-8 py-3 rounded transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-8 flex-1">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/cart" className="hover:text-brand transition-colors">Cart</Link>
          <span>&gt;</span>
          <span className="text-gray-500">Checkout</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-heading mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left — Shipping form */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-100 p-6 lg:p-8">
                <h2 className="text-lg font-bold text-heading mb-6">Shipping Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      First Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.firstname}
                      onChange={(e) => handleField("firstname", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Last Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.lastname}
                      onChange={(e) => handleField("lastname", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Street Address <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.street}
                      onChange={(e) => handleField("street", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      City <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => handleField("city", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      State <span className="text-brand">*</span>
                    </label>
                    <select
                      value={shipping.state}
                      onChange={(e) => handleField("state", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors bg-white"
                      required
                    >
                      <option value="">Select state...</option>
                      {usStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      ZIP Code <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.zip}
                      onChange={(e) => handleField("zip", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Phone <span className="text-brand">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => handleField("phone", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-[#F5F5F5] rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-heading mb-4">Order Summary</h2>

                {/* Items */}
                <div className="divide-y divide-gray-200 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3">
                      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-heading line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-heading mt-0.5">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-body">Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-heading">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Shipping &amp; taxes calculated at checkout
                </p>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3 mb-4">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-heading hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded transition-colors tracking-wide"
                >
                  {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
                </button>

                <Link
                  href="/cart"
                  className="block text-sm text-body hover:text-brand transition-colors text-center mt-4"
                >
                  &larr; Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
