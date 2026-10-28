import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOrder } from "@/lib/domain/admin-orders";

type Row = {
  id: number;
  created_at: string;
  items: { title: string; label: string; qty: number }[];
  total_estimated: number | string;
  customer_name: string | null;
  vehicle: string | null;
  coupon_code: string | null;
  status: AdminOrder["status"];
};

/** Pedidos do mais novo ao mais antigo; o RLS só deixa o admin ler (ORD-01 AC 4). */
export async function loadOrders(supabase: SupabaseClient): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, items, total_estimated, customer_name, vehicle, coupon_code, status")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    items: r.items,
    total: Number(r.total_estimated),
    name: r.customer_name,
    vehicle: r.vehicle,
    coupon: r.coupon_code,
    status: r.status,
  }));
}
