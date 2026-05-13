"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Product, CategoryInfo } from "@/lib/magento";

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ColorSwatch({
  color,
  border,
  label,
}: {
  color: string;
  border?: boolean;
  label: string;
}) {
  return (
    <button
      title={label}
      className={`w-6 h-6 rounded-full shrink-0 ${
        border ? "border border-gray-300" : ""
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

const colorSwatches = [
  { color: "#FFFFFF", label: "White", border: true },
  { color: "#1A1A1A", label: "Black" },
  { color: "#808080", label: "Gray" },
  { color: "#8B4513", label: "Brown" },
  { color: "#EC4899", label: "Pink" },
  { color: "#EF4444", label: "Red" },
  { color: "#F97316", label: "Orange" },
  { color: "#EAB308", label: "Yellow" },
  { color: "#10B981", label: "Green" },
  { color: "#3B82F6", label: "Blue" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProductsClient({
  products,
  title,
  breadcrumbs,
  categoryNames,
  searchQuery,
  pagination,
}: {
  products: Product[];
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  categoryNames?: Record<string, CategoryInfo>;
  searchQuery?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const defaultBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "All Products" },
  ];
  const [sortBy, setSortBy] = useState("Position");
  const [showCount, setShowCount] = useState("24");
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: true,
    color: true,
    onSale: true,
    paddedSeat: true,
    brand: true,
  });
  const [checkedFilters, setCheckedFilters] = useState<Record<string, boolean>>({});

  const toggleFilter = (key: string) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCheckbox = (key: string) => {
    setCheckedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages } = pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8 mb-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {pages.map((page, idx) =>
          typeof page === "string" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-body">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm border rounded transition-colors ${
                page === currentPage
                  ? "bg-brand text-white border-brand"
                  : "border-gray-300 hover:border-brand"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  // Derive filter counts from real data
  const categoryMap = new Map<string, number>();
  products.forEach((p) => {
    p.categoryIds.forEach((id) => {
      categoryMap.set(id, (categoryMap.get(id) || 0) + 1);
    });
  });

  const categoryFilters = Array.from(categoryMap.entries()).map(([id, count]) => {
    const info = categoryNames?.[id];
    return {
      id,
      label: info?.name || `Category ${id}`,
      href: info?.urlPath ? `/products/${info.urlPath}` : null,
      count,
    };
  });

  const brandFilters = [
    { label: "Titan Event Furniture™", count: products.length },
  ];

  let sorted = [...products];

  if (sortBy === "Name (A-Z)") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Name (Z-A)") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === "Price (Low-High)") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === "Price (High-Low)") {
    sorted.sort((a, b) => b.price - a.price);
  }

  const displayed = sorted;

  return (
    <>
      {/* Breadcrumbs & Title */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          {(breadcrumbs || defaultBreadcrumbs).map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <span>&gt;</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-brand transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-500">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-heading mb-2">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : title || "All Products"}
        </h1>
        {searchQuery && (
          <p className="text-sm text-body mb-4">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        )}
      </div>

      {/* Main Content (Sidebar + Grid) */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            {/* CATEGORY */}
            <div className="border-t border-gray-200 py-3">
              <button
                onClick={() => toggleFilter("category")}
                className="flex items-center justify-between w-full text-sm font-bold text-heading mb-3"
              >
                CATEGORY
                <span className="text-xs font-normal">
                  {expandedFilters.category ? "−" : "+"}
                </span>
              </button>
              {expandedFilters.category && (
                <div className="space-y-2">
                  {categoryFilters.map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 text-sm text-body cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedFilters[f.id]}
                        onChange={() => toggleCheckbox(f.id)}
                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                      />
                      {f.href ? (
                        <Link href={f.href} className="hover:text-brand transition-colors">
                          {f.label} ({f.count})
                        </Link>
                      ) : (
                        <span>{f.label} ({f.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* COLOR */}
            <div className="border-t border-gray-200 py-3">
              <button
                onClick={() => toggleFilter("color")}
                className="flex items-center justify-between w-full text-sm font-bold text-heading mb-3"
              >
                COLOR
                <span className="text-xs font-normal">
                  {expandedFilters.color ? "−" : "+"}
                </span>
              </button>
              {expandedFilters.color && (
                <div className="flex flex-wrap gap-2">
                  {colorSwatches.map((swatch) => (
                    <ColorSwatch key={swatch.label} {...swatch} />
                  ))}
                </div>
              )}
            </div>

            {/* ON SALE */}
            <div className="border-t border-gray-200 py-3">
              <button
                onClick={() => toggleFilter("onSale")}
                className="flex items-center justify-between w-full text-sm font-bold text-heading mb-3"
              >
                ON SALE
                <span className="text-xs font-normal">
                  {expandedFilters.onSale ? "−" : "+"}
                </span>
              </button>
              {expandedFilters.onSale && (
                <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checkedFilters["onSale"]}
                    onChange={() => toggleCheckbox("onSale")}
                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                  />
                  <span>On Sale (0)</span>
                </label>
              )}
            </div>

            {/* PADDED SEAT */}
            <div className="border-t border-gray-200 py-3">
              <button
                onClick={() => toggleFilter("paddedSeat")}
                className="flex items-center justify-between w-full text-sm font-bold text-heading mb-3"
              >
                PADDED SEAT
                <span className="text-xs font-normal">
                  {expandedFilters.paddedSeat ? "−" : "+"}
                </span>
              </button>
              {expandedFilters.paddedSeat && (
                <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checkedFilters["paddedSeat"]}
                    onChange={() => toggleCheckbox("paddedSeat")}
                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                  />
                  <span>Yes (0)</span>
                </label>
              )}
            </div>

            {/* BRAND */}
            <div className="border-t border-gray-200 py-3">
              <button
                onClick={() => toggleFilter("brand")}
                className="flex items-center justify-between w-full text-sm font-bold text-heading mb-3"
              >
                BRAND
                <span className="text-xs font-normal">
                  {expandedFilters.brand ? "−" : "+"}
                </span>
              </button>
              {expandedFilters.brand && (
                <div className="space-y-2">
                  {brandFilters.map((f) => (
                    <label
                      key={f.label}
                      className="flex items-center gap-2 text-sm text-body cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedFilters[f.label]}
                        onChange={() => toggleCheckbox(f.label)}
                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand"
                      />
                      <span>{f.label} ({f.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* My Wish List */}
            <div className="border-t border-gray-200 pt-4 pb-2">
              <h3 className="text-sm font-bold text-heading mb-2">My Wish List</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                You have no items in your wish list.
              </p>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Top Control Bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-body">
                {pagination ? `${pagination.totalItems} Items` : `${products.length} Items`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-body">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-brand text-heading"
                >
                  <option>Position</option>
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                  <option>Price (Low-High)</option>
                  <option>Price (High-Low)</option>
                </select>
                <button className="text-gray-400 hover:text-heading transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7 L10 7 M3 12 L14 12 M3 17 L21 17" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Pricing Alert Bar */}
            <Link href="/login" className="block bg-brand hover:bg-brand-dark text-white text-center py-2.5 rounded text-sm font-medium mb-4 transition-colors">
              Login or Register to View Prices
            </Link>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {displayed.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${encodeURIComponent(product.urlKey || product.sku)}`}
                  className="bg-white border border-gray-100 rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="6" y="10" width="36" height="28" rx="2" />
                          <circle cx="17" cy="20" r="3" />
                          <path d="M6 30 L18 22 L26 28 L36 18 L42 22 L42 38 L6 38Z" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-sm text-body leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400">{product.sku}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Pagination */}
            {renderPagination()}

            {/* Bottom Control Bar */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-8">
              <span className="text-sm text-body">
                {pagination
                  ? `Showing ${((pagination.currentPage - 1) * pagination.pageSize) + 1}-${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems} items`
                  : `${products.length} Items`}
              </span>
              {!pagination && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-body">Show</span>
                  <select
                    value={showCount}
                    onChange={(e) => setShowCount(e.target.value)}
                    className="text-sm border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-brand text-heading"
                  >
                    <option>12</option>
                    <option>24</option>
                    <option>48</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
