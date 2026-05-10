import { getCategories } from "@/lib/magento";

export async function GET() {
  const categories = await getCategories();
  return Response.json(categories);
}
