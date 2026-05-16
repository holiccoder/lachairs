"use client";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "quick";
  loading?: boolean;
  label?: string;
}

export default function AddToCartButton({
  onClick,
  disabled = false,
  variant = "primary",
  loading = false,
  label,
}: AddToCartButtonProps) {
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full font-semibold text-sm px-8 py-3 rounded transition-colors tracking-wide ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-brand hover:bg-brand-dark text-white"
        }`}
      >
        {loading ? "ADDING..." : label || "ADD TO CART"}
      </button>
    );
  }

  // quick variant for product grid
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled || loading}
      className={`w-full text-center text-xs rounded py-1.5 transition-colors ${
        disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "text-brand border border-brand/30 hover:bg-brand hover:text-white"
      }`}
    >
      {loading ? "Adding..." : label || "Add to Cart"}
    </button>
  );
}
