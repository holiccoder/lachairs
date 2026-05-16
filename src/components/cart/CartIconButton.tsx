"use client";

import { useCart } from "@/context/CartContext";

export default function CartIconButton() {
  const { itemCount, toggleDrawer } = useCart();

  return (
    <button
      onClick={() => toggleDrawer()}
      className="relative text-heading hover:text-brand transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1 H5 L7.68 14.39 A2 2 0 0 0 9.66 16 H19.4 A2 2 0 0 0 21.36 14.39 L23 6 H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
