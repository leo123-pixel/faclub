import { loadOrders } from "@/lib/data/admin-orders";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { OrdersList } from "./OrdersList";

export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const orders = await loadOrders(supabase);
  return (
    <>
      <PageHeader eyebrow="Vendas" title="Pedidos" />
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line-soft bg-white p-8 text-center text-muted">Nenhum pedido ainda.</p>
      ) : (
        <OrdersList
          orders={orders}
          status={(o) => <span className="rounded-full bg-bg px-3 py-1 text-sm font-semibold text-ink">{o.status}</span>}
        />
      )}
    </>
  );
}
