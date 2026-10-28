import { notFound } from "next/navigation";
import { loadCategories } from "@/lib/data/admin-products";
import { loadBrandOptions, loadProductForm } from "@/lib/data/admin-product-form";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { ProductEditor } from "../ProductEditor";

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, brands, categories] = await Promise.all([
    loadProductForm(supabase, id),
    loadBrandOptions(supabase),
    loadCategories(supabase),
  ]);
  if (!product) notFound();
  return <ProductEditor mode="editar" initial={product} brands={brands} categories={categories} />;
}
