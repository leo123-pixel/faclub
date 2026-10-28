import { PageHeader } from "../PageHeader";

// A lista completa de pedidos chega na feature carrinho-pedidos (ORD-01).
export default function OrdersPage() {
  return (
    <>
      <PageHeader eyebrow="Vendas" title="Pedidos" />
      <p className="rounded-2xl border border-line-soft bg-white p-8 text-center text-muted">Nenhum pedido ainda.</p>
    </>
  );
}
