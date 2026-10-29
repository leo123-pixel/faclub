import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { CouponsManager } from "./CouponsManager";

export default async function CouponsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, percent, description, is_active")
    .order("created_at");
  if (error) throw error;
  const coupons = data.map((c) => ({
    id: c.id as string,
    code: c.code as string,
    percent: c.percent as number,
    description: c.description as string,
    isActive: c.is_active as boolean,
  }));
  return (
    <>
      <PageHeader eyebrow="Ofertas" title="Cupons" />
      <CouponsManager coupons={coupons} />
    </>
  );
}
