import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsClient from "../ProductsClient";
import { getCategoryByUrlKey, getProductsByCategory, getCategoryLookup } from "@/lib/magento";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Props {
  params: Promise<{ category: string[] }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category: segments } = await params;

  // Try as url_key (last segment), then as full url_path
  const urlKey = segments[segments.length - 1];
  const urlPath = segments.join("/");

  let category =
    (await getCategoryByUrlKey(urlKey)) ||
    (await getCategoryByUrlKey(urlPath));

  if (!category) {
    notFound();
  }

  const [result, categoryNames] = await Promise.all([
    getProductsByCategory(category.id),
    getCategoryLookup(),
  ]);

  // Build breadcrumbs from url_path segments
  const pathSegments = category.urlPath ? category.urlPath.split("/") : [category.urlKey];
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
  ];

  for (let i = 0; i < pathSegments.length; i++) {
    const isLast = i === pathSegments.length - 1;
    const slugPath = "/products/" + pathSegments.slice(0, i + 1).join("/");
    breadcrumbs.push({
      label: slugToLabel(pathSegments[i]),
      href: isLast ? undefined : slugPath,
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <ProductsClient
        products={result.items}
        title={category.name}
        breadcrumbs={breadcrumbs}
        categoryNames={categoryNames}
      />

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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
