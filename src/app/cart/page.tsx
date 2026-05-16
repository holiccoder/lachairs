"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import QuantitySelector from "@/components/cart/QuantitySelector";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-8 flex-1">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-500">Shopping Cart</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-heading mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          /* Empty cart */
          <div className="text-center py-20">
            <svg
              className="w-20 h-20 text-gray-300 mx-auto mb-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1 H5 L7.68 14.39 A2 2 0 0 0 9.66 16 H19.4 A2 2 0 0 0 21.36 14.39 L23 6 H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-lg font-semibold text-heading mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-body mb-8">
              Browse our products and add items to get started.
            </p>
            <Link
              href="/products"
              className="inline-block bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3 rounded transition-colors tracking-wide"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart table */}
            <div className="flex-1 min-w-0">
              {/* Desktop table header */}
              <div className="hidden md:grid grid-cols-[3fr_1fr_1.2fr_1fr_0.3fr] gap-4 pb-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span />
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col md:grid md:grid-cols-[3fr_1fr_1.2fr_1fr_0.3fr] gap-4 items-center"
                  >
                    {/* Product */}
                    <div className="flex gap-4 items-center w-full">
                      <Link
                        href={`/product/${encodeURIComponent(item.urlKey)}`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-gray-50 border border-gray-100 shrink-0"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
                              <rect x="6" y="10" width="36" height="28" rx="2" />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${encodeURIComponent(item.urlKey)}`}
                          className="text-sm font-medium text-heading hover:text-brand transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {Object.entries(item.selectedOptions)
                              .map(
                                ([attrId, val]) =>
                                  `${item.optionLabels[attrId] || attrId}: ${val}`
                              )
                              .join(", ")}
                          </p>
                        )}
                        {/* Mobile price + remove */}
                        <div className="flex items-center justify-between mt-2 md:hidden">
                          <span className="text-sm font-semibold text-heading">
                            {isLoggedIn ? formatPrice(item.price) : "—"}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price (desktop) */}
                    <span className="hidden md:block text-sm text-heading font-medium">
                      {isLoggedIn ? formatPrice(item.price) : "—"}
                    </span>

                    {/* Quantity */}
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.id, qty)}
                      size="sm"
                    />

                    {/* Total (desktop) */}
                    <span className="hidden md:block text-sm font-semibold text-heading">
                      {isLoggedIn
                        ? formatPrice(item.price * item.quantity)
                        : "—"}
                    </span>

                    {/* Remove (desktop) */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="hidden md:block text-gray-400 hover:text-red-500 transition-colors justify-self-center"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-200">
                <Link
                  href="/products"
                  className="text-sm text-body hover:text-brand transition-colors"
                >
                  &larr; Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-[#F5F5F5] rounded-lg p-6">
                <h2 className="text-lg font-bold text-heading mb-4">
                  Order Summary
                </h2>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-body">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold text-heading">
                    {isLoggedIn ? formatPrice(subtotal) : "—"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Shipping &amp; taxes calculated at checkout
                </p>

                {isLoggedIn ? (
                  <button className="w-full bg-heading hover:bg-gray-800 text-white font-semibold text-sm py-3 rounded transition-colors tracking-wide">
                    Proceed to Checkout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3 rounded transition-colors tracking-wide"
                  >
                    Login to Checkout
                  </Link>
                )}

                {!isLoggedIn && (
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    Wholesale pricing and checkout are available for approved
                    business accounts.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
