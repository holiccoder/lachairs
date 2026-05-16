"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import QuantitySelector from "./QuantitySelector";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    toggleDrawer,
  } = useCart();
  const { isLoggedIn } = useAuth();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[59]"
            onClick={() => toggleDrawer(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[60] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-heading">
                Shopping Cart ({itemCount})
              </h2>
              <button
                onClick={() => toggleDrawer(false)}
                className="text-gray-400 hover:text-heading transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18 M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1 H5 L7.68 14.39 A2 2 0 0 0 9.66 16 H19.4 A2 2 0 0 0 21.36 14.39 L23 6 H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-body mb-2">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={() => toggleDrawer(false)}
                    className="text-sm text-brand hover:text-brand-dark font-semibold transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                      <Link
                        href={`/product/${encodeURIComponent(item.urlKey)}`}
                        onClick={() => toggleDrawer(false)}
                        className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 border border-gray-100 shrink-0"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
                              <rect x="6" y="10" width="36" height="28" rx="2" />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${encodeURIComponent(item.urlKey)}`}
                          onClick={() => toggleDrawer(false)}
                          className="text-sm font-medium text-heading hover:text-brand transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {Object.entries(item.selectedOptions)
                              .map(([attrId, val]) => `${item.optionLabels[attrId] || attrId}: ${val}`)
                              .join(", ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(qty) => updateQuantity(item.id, qty)}
                            size="sm"
                          />
                          <div className="flex items-center gap-3">
                            {isLoggedIn && item.price > 0 ? (
                              <span className="text-sm font-semibold text-heading">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Login for price</span>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-body">Subtotal</span>
                  <span className="text-lg font-bold text-heading">
                    {isLoggedIn ? formatPrice(subtotal) : "—"}
                  </span>
                </div>
                {!isLoggedIn && (
                  <p className="text-xs text-gray-400 text-center">
                    Log in to view pricing and checkout
                  </p>
                )}
                <Link
                  href="/cart"
                  onClick={() => toggleDrawer(false)}
                  className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-2.5 rounded transition-colors tracking-wide"
                >
                  View Cart
                </Link>
                {isLoggedIn ? (
                  <button className="w-full bg-heading hover:bg-gray-800 text-white font-semibold text-sm py-2.5 rounded transition-colors tracking-wide">
                    Checkout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => toggleDrawer(false)}
                    className="block w-full text-center border-2 border-brand text-brand hover:bg-brand hover:text-white font-semibold text-sm py-2.5 rounded transition-colors tracking-wide"
                  >
                    Login to Checkout
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
