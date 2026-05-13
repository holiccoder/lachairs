import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductClient from "./ProductClient";
import { getProductByUrlKey, getProductBySku } from "@/lib/magento";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Try url_key first, fall back to SKU
  let product = await getProductByUrlKey(slug);
  if (!product) {
    product = await getProductBySku(slug);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/products" className="hover:text-brand transition-colors">Products</Link>
          <span>&gt;</span>
          <span className="text-gray-500">{product.name}</span>
        </nav>
      </div>

      <ProductClient product={product} />

      <Footer />
    </div>
  );
}
