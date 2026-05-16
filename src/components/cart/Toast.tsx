"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/context/CartContext";

export default function Toast() {
  const { toastMessage } = useCart();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] bg-white shadow-xl border border-gray-200 rounded-lg p-4 flex items-center gap-3 max-w-sm"
        >
          {toastMessage.image && (
            <img
              src={toastMessage.image}
              alt=""
              className="w-10 h-10 object-contain rounded shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-heading truncate">
              {toastMessage.productName}
            </p>
            <p className="text-xs text-body">Added to cart</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
