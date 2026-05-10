import { getAllProducts } from "@/lib/magento";
import HomeClient from "./HomeClient";

export default async function Home() {
  const products = await getAllProducts();

  return <HomeClient products={products} />;
}
