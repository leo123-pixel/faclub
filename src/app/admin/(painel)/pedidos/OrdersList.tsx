import { formatOrderDate, orderItemsSummary, type AdminOrder } from "@/lib/domain/admin-orders";
import { formatBRL } from "@/lib/domain/money";
import type { ReactNode } from "react";

/** Um cartão por pedido; `status` desenha o status (texto ou seletor). */
export function OrdersList({ orders, status }: { orders: AdminOrder[]; status: (o: AdminOrder) => ReactNode }) {
  return (
    <ul aria-label="Pedidos" className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} aria-label={`Pedido nº ${o.id}`} className="rounded-2xl border border-line-soft bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-[18px] font-semibold text-ink">Pedido nº {o.id}</p>
              <p className="text-sm text-muted">{formatOrderDate(o.createdAt)}</p>
            </div>
            <div>{status(o)}</div>
          </div>
          <ul aria-label="Itens" className="mt-3 space-y-1 text-[15px] text-ink">
            {orderItemsSummary(o.items).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted">Total estimado</dt>
              <dd className="font-semibold text-ink">{formatBRL(o.total)}</dd>
            </div>
            <div>
              <dt className="text-muted">Nome</dt>
              <dd className="text-ink">{o.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Veículo</dt>
              <dd className="text-ink">{o.vehicle ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Cupom</dt>
              <dd className="text-ink">{o.coupon ?? "—"}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
