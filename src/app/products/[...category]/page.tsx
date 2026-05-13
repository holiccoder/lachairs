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
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: segments } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam || "1", 10);
  const pageSize = 24;

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
    getProductsByCategory(category.id, currentPage, pageSize),
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

  const totalPages = Math.ceil(result.total / pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <ProductsClient
        products={result.items}
        title={category.name}
        breadcrumbs={breadcrumbs}
        categoryNames={categoryNames}
        pagination={{
          currentPage,
          totalPages,
          totalItems: result.total,
          pageSize,
        }}
      />

      <Footer />
    </div>
  );
}
