import Link from "next/link";
import type { ReactNode } from "react";
import { ProductThumb } from "@/components/admin/ProductThumb";
import { displayVariant, productTitle, stockLabel, type AdminProductRow } from "@/lib/domain/admin-products";
import { formatBRL } from "@/lib/domain/money";

export type ToggleSlot = (row: AdminProductRow, field: "isPromo" | "isVisible") => ReactNode;

function Stock({ stock }: { stock: number }) {
  const s = stockLabel(stock);
  return s.low ? (
    <span className="rounded-full bg-low px-2.5 py-1 text-[13px] font-semibold text-low-ink">{s.text}</span>
  ) : (
    <span>{s.text}</span>
  );
}

const subline = (r: AdminProductRow) => `${displayVariant(r).label} · SKU ${r.sku ?? "—"}`;
const title = (r: AdminProductRow) => productTitle(r.brandName, r.name);

/** Tabela a partir de 768 px; abaixo, cartões empilhados com os mesmos dados. */
export function ProductsTable({ rows, toggle }: { rows: AdminProductRow[]; toggle: ToggleSlot }) {
  return (
    <>
      <table className="hidden w-full text-left text-[15px] md:table">
        <thead>
          <tr className="border-b border-line-soft text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            <th className="px-5 py-3">Produto</th>
            <th className="px-3 py-3">Categoria</th>
            <th className="px-3 py-3">Preço</th>
            <th className="px-3 py-3">Estoque</th>
            <th className="px-3 py-3">Oferta</th>
            <th className="px-3 py-3">Visível no site</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} aria-label={title(r)} className="border-b border-line-soft last:border-0">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <ProductThumb path={r.coverPath} name={title(r)} />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{title(r)}</p>
                    <p className="text-[13px] text-muted">{subline(r)}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-ink">{r.categoryName}</td>
              <td className="px-3 py-3 text-ink">{formatBRL(displayVariant(r).price)}</td>
              <td className="px-3 py-3 text-ink">
                <Stock stock={r.stock} />
              </td>
              <td className="px-3 py-3">{toggle(r, "isPromo")}</td>
              <td className="px-3 py-3">{toggle(r, "isVisible")}</td>
              <td className="px-5 py-3 text-right">
                <EditLink id={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line-soft md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <article aria-label={title(r)} className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <ProductThumb path={r.coverPath} name={title(r)} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{title(r)}</p>
                  <p className="text-[13px] text-muted">{subline(r)}</p>
                  <p className="mt-1 text-[13px] text-muted">{r.categoryName}</p>
                </div>
                <EditLink id={r.id} />
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
                <span className="font-semibold">{formatBRL(displayVariant(r).price)}</span>
                <Stock stock={r.stock} />
              </div>
              <div className="flex flex-wrap gap-x-6">
                <label className="flex items-center gap-2 text-sm text-muted">Oferta {toggle(r, "isPromo")}</label>
                <label className="flex items-center gap-2 text-sm text-muted">Visível {toggle(r, "isVisible")}</label>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}

function EditLink({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/produtos/${id}`}
      className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink"
    >
      Editar
    </Link>
  );
}
