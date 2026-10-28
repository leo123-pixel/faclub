import { randomUUID } from "node:crypto";
import { loadCategories } from "@/lib/data/admin-products";
import { loadBrandOptions } from "@/lib/data/admin-product-form";
import { emptyProduct } from "@/lib/domain/product-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { ProductEditor } from "../ProductEditor";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const [brands, categories] = await Promise.all([loadBrandOptions(supabase), loadCategories(supabase)]);
  return <ProductEditor mode="novo" initial={emptyProduct(randomUUID())} brands={brands} categories={categories} />;
}
