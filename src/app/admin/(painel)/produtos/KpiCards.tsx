import type { AdminKpis } from "@/lib/domain/admin-products";

export function KpiCards({ kpis }: { kpis: AdminKpis }) {
  const card = "rounded-2xl border border-line-soft bg-white px-5 py-5";
  const label = "text-sm text-muted";
  const value = "mt-2 font-display text-[34px] font-semibold leading-none";
  return (
    <section aria-label="Indicadores" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <div className={card}>
        <p className={label}>Produtos ativos</p>
        <p className={`${value} text-ink`}>{kpis.active}</p>
      </div>
      <div className={card}>
        <p className={label}>Em oferta</p>
        <p className={`${value} text-ink`}>{kpis.promo}</p>
      </div>
      <div className={card}>
        <p className={label}>Estoque baixo</p>
        <p className={`${value} text-low-ink`}>{kpis.lowStock}</p>
      </div>
      <div className="rounded-2xl bg-ink px-5 py-5">
        <p className="text-sm text-white/75">Pedidos · 30 dias</p>
        <p className={`${value} text-gold`}>{kpis.orders30}</p>
      </div>
    </section>
  );
}
