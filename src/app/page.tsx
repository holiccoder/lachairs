import { getAllProducts } from "@/lib/magento";
import HomeClient from "./HomeClient";

export default async function Home() {
  const products = await getAllProducts();
  const filtered = products.filter((p) => p.sku !== "SC");

  return <HomeClient products={filtered} />;
}
