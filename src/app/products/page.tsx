import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsClient from "./ProductsClient";
import { getAllProducts, getCategoryLookup, searchProducts } from "@/lib/magento";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [result, categoryNames] = await Promise.all([
    q ? searchProducts(q) : getAllProducts(),
    getCategoryLookup(),
  ]);

  const products = Array.isArray(result) ? result : result.items;
  const searchQuery = q || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <ProductsClient
        products={products}
        categoryNames={categoryNames}
        searchQuery={searchQuery}
      />

      {/* Promotional Banner */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full mb-16">
        <div className="bg-[#FAF6EE] rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-heading" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M8 12 L11 15 L16 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold text-heading tracking-wide">
                GOOD SHUFFLE PRO
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-heading mb-3">
              Grow Your Event Business
            </h2>
            <p className="text-base text-body leading-relaxed mb-6 max-w-md">
              Save time, sell more, and get paid fast with powerful software for event rental
              pros.
            </p>
            <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm px-8 py-3 rounded-full transition-colors self-start tracking-wide">
              Get Started
            </button>
          </div>
          <div className="flex-1 relative min-h-[300px] bg-[#F0EBE0]">
            <img
              src="https://loremflickr.com/600/400/office-worker,laptop"
              alt="Woman working on laptop"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-medium text-heading">
              Avery Chair
            </div>
            <div className="absolute bottom-12 left-6 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-medium text-heading">
              Low Cocktail Table
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-2">
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#2563EB]" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
              </svg>
              <span className="text-xs font-semibold text-heading">4 Subrentals</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
