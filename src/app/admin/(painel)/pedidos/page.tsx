import Link from "next/link";
import { loadOrders } from "@/lib/data/admin-orders";
import { filterOrders, isOrderStatus, ORDER_STATUSES } from "@/lib/domain/admin-orders";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { OrdersList } from "./OrdersList";
import { OrderStatus } from "./OrderStatus";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const requested = one((await searchParams).status);
  const status = isOrderStatus(requested) ? requested : "";
  const { supabase } = await requireAdmin();
  const all = await loadOrders(supabase);
  const orders = filterOrders(all, status);
  const tabs = [{ label: "Todos", value: "" }, ...ORDER_STATUSES.map((s) => ({ label: s, value: s }))];

  return (
    <>
      <PageHeader eyebrow="Vendas" title="Pedidos" />
      {all.length === 0 ? (
        <p className="rounded-2xl border border-line-soft bg-white p-8 text-center text-muted">Nenhum pedido ainda.</p>
      ) : (
        <>
          <nav aria-label="Filtrar por status" className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => {
              const current = t.value === status;
              return (
                <Link
                  key={t.label}
                  href={t.value ? `/admin/pedidos?status=${encodeURIComponent(t.value)}` : "/admin/pedidos"}
                  aria-current={current ? "page" : undefined}
                  className={`h-10 rounded-full px-4 text-sm font-semibold leading-10 ${
                    current ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-ink"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-line-soft bg-white p-8 text-center text-muted">
              Nenhum pedido com o status {status}.
            </p>
          ) : (
            <OrdersList orders={orders} status={(o) => <OrderStatus key={`${o.id}-${o.status}`} id={o.id} initial={o.status} />} />
          )}
        </>
      )}
    </>
  );
}
