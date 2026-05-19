"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { Category } from "@/lib/magento";
import { useAuth } from "@/hooks/useAuth";
import CartIconButton from "@/components/cart/CartIconButton";
import CartDrawer from "@/components/cart/CartDrawer";
import Toast from "@/components/cart/Toast";

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(0);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
    setMegaMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      if (accountCloseTimer.current) {
        clearTimeout(accountCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const openMegaMenu = useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
    setMegaMenuOpen(true);
  }, []);

  const closeMegaMenu = useCallback(() => {
    megaCloseTimer.current = setTimeout(() => setMegaMenuOpen(false), 200);
  }, []);

  const openAccountMenu = useCallback(() => {
    if (accountCloseTimer.current) {
      clearTimeout(accountCloseTimer.current);
      accountCloseTimer.current = null;
    }
    setAccountMenuOpen(true);
  }, []);

  const closeAccountMenu = useCallback(() => {
    accountCloseTimer.current = setTimeout(() => setAccountMenuOpen(false), 160);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.jpg" alt="Lachairs" className="h-16 w-auto object-contain" />
        </Link>

        {/* Nav Links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Categories — mega menu trigger */}
          <div
            className="relative"
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
          >
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                megaMenuOpen ? "text-brand" : "text-heading hover:text-brand"
              }`}
            >
              Categories
              <svg className="w-3 h-3 mt-px" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 5 L6 8 L9 5" />
              </svg>
            </button>
          </div>
        </nav>

        {/* CTA */}
        <Link
          href="/register"
          className="hidden lg:block bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors whitespace-nowrap"
        >
          CREATE WHOLESALE ACCOUNT
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center border border-gray-200 rounded px-3 py-2 gap-2 flex-1 max-w-[260px]">
          <button type="submit" className="shrink-0" aria-label="Search">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7" />
              <line x1="15" y1="15" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </button>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className="text-sm text-body placeholder-gray-400 outline-none bg-transparent w-full"
          />
        </form>

        {/* Account & Cart */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {auth.isLoggedIn ? (
            <div
              ref={accountMenuRef}
              className="relative"
              onMouseEnter={openAccountMenu}
              onMouseLeave={closeAccountMenu}
            >
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 text-sm text-body hover:text-heading transition-colors"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <span>Hello, {auth.firstName || "Account"}</span>
                <svg className="w-3 h-3 mt-px" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 5 L6 8 L9 5" />
                </svg>
              </button>

              {accountMenuOpen ? (
                <div className="absolute right-0 top-full pt-2 z-50" onMouseEnter={openAccountMenu}>
                  <div className="w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-heading hover:bg-gray-50"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        auth.logout();
                        setAccountMenuOpen(false);
                        router.push("/");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 text-sm text-body hover:text-heading transition-colors">
              <span>Hello Guest / Sign In</span>
              <svg className="w-3 h-3 mt-px" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 5 L6 8 L9 5" />
              </svg>
            </Link>
          )}
          <CartIconButton />
        </div>

        {/* Mobile cart & hamburger */}
        <div className="lg:hidden flex items-center gap-3">
          <CartIconButton />
          <button
            className="text-heading"
            onClick={() => {
            const next = !mobileMenuOpen;
            setMobileMenuOpen(next);
            if (!next) setMobileCategoryOpen(false);
          }}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
                <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
                <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4"
        >
          <div>
            <button
              onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
              className="flex items-center gap-1 text-sm font-medium text-heading w-full"
            >
              Categories
              <svg
                className={`w-3 h-3 mt-px transition-transform ${mobileCategoryOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M3 5 L6 8 L9 5" />
              </svg>
            </button>
            {mobileCategoryOpen && categories.length > 0 && (
              <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-200 space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/products/${cat.urlPath || cat.urlKey}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-heading hover:text-brand transition-colors block py-0.5"
                    >
                      {cat.name}
                    </Link>
                    {cat.children.length > 0 && (
                      <div className="ml-3 mt-1 space-y-1">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products/${child.urlPath || child.urlKey}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-body hover:text-brand transition-colors block py-0.5"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/register" className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors text-center">
            CREATE WHOLESALE ACCOUNT
          </Link>
          {auth.isLoggedIn ? (
            <Link href="/dashboard" className="text-sm font-medium text-heading hover:text-brand transition-colors text-center">
              My Account
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-heading hover:text-brand transition-colors text-center">
              Sign In / My Account
            </Link>
          )}
          <form onSubmit={handleSearch} className="flex items-center border border-gray-200 rounded px-3 py-2 gap-2">
            <button type="submit" aria-label="Search">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="7" />
                <line x1="15" y1="15" x2="21" y2="21" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="text-sm outline-none bg-transparent w-full"
            />
          </form>
        </motion.div>
      )}

      {/* Mega Menu */}
      {megaMenuOpen && categories.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-100"
          onMouseEnter={openMegaMenu}
          onMouseLeave={closeMegaMenu}
        >
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex">
            {/* Left sidebar */}
            <div className="w-56 shrink-0 border-r border-gray-100 py-4">
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveMegaCategory(i)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    i === activeMegaCategory
                      ? "bg-brand text-white"
                      : "text-heading hover:bg-gray-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.children.length > 0 && (
                    <svg
                      className={`w-3 h-3 shrink-0 ${i === activeMegaCategory ? "text-white" : "text-gray-400"}`}
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M4.5 3 L7.5 6 L4.5 9" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Right content area */}
            <div className="flex-1 py-6 px-8 relative">
              {categories[activeMegaCategory]?.children.length > 0 ? (
                <>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-6">
                    {categories[activeMegaCategory].children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products/${sub.urlPath}`}
                        className="block text-sm text-body hover:text-brand transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/products/${categories[activeMegaCategory].urlPath}`}
                    className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark transition-colors mt-6 font-medium"
                  >
                    Shop more in {categories[activeMegaCategory].name}
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M4.5 3 L7.5 6 L4.5 9" />
                    </svg>
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <Link
                    href={`/products/${categories[activeMegaCategory]?.urlPath ?? "#"}`}
                    className="text-sm text-brand hover:text-brand-dark transition-colors font-medium"
                  >
                    Shop {categories[activeMegaCategory]?.name ?? ""}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <CartDrawer />
      <Toast />
    </header>
  );
}
