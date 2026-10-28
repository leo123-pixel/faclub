import { randomUUID } from "node:crypto";
import { loadCategories } from "@/lib/data/admin-products";
import { loadBrandOptions, loadProductForm } from "@/lib/data/admin-product-form";
import { emptyProduct, type ProductFormValues } from "@/lib/domain/product-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { ProductEditor } from "../ProductEditor";

/** Cópia para "Duplicar": novo id, " (cópia)" no nome e oculta; as fotos apontam para os mesmos arquivos. */
function asCopy(source: ProductFormValues): ProductFormValues {
  return { ...source, id: randomUUID(), name: `${source.name} (cópia)`, isVisible: false };
}

export default async function NewProductPage({ searchParams }: PageProps<"/admin/produtos/novo">) {
  const { de } = await searchParams;
  const { supabase } = await requireAdmin();
  const [brands, categories, source] = await Promise.all([
    loadBrandOptions(supabase),
    loadCategories(supabase),
    typeof de === "string" && /^[0-9a-f-]{36}$/i.test(de) ? loadProductForm(supabase, de) : null,
  ]);
  const initial = source ? asCopy(source) : emptyProduct(randomUUID());
  return <ProductEditor mode="novo" initial={initial} brands={brands} categories={categories} />;
}
