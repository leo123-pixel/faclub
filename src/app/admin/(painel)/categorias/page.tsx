import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { CategoriesManager } from "./CategoriesManager";

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, position, products(count)")
    .order("position")
    .order("name");
  if (error) throw error;
  const categories = data.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    count: (c.products as unknown as { count: number }[])[0]?.count ?? 0,
  }));
  return (
    <>
      <PageHeader eyebrow="Catálogo" title="Categorias" />
      <CategoriesManager categories={categories} />
    </>
  );
}
