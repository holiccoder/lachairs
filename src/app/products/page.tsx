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

      <Footer />
    </div>
  );
}
