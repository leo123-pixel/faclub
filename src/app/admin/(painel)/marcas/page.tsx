import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { BrandsManager } from "./BrandsManager";

export default async function BrandsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("brands").select("id, name, logo_path, products(count)").order("name");
  if (error) throw error;
  const brands = data.map((b) => ({
    id: b.id as string,
    name: b.name as string,
    logoPath: b.logo_path as string | null,
    count: (b.products as unknown as { count: number }[])[0]?.count ?? 0,
  }));
  return (
    <>
      <PageHeader eyebrow="Catálogo" title="Marcas" />
      <BrandsManager brands={brands} />
    </>
  );
}
