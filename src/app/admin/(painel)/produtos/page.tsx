import Link from "next/link";
import { RowToggle } from "@/components/admin/RowToggle";
import { countOrdersLast30Days, loadAdminProducts, loadCategories } from "@/lib/data/admin-products";
import { adminKpis, filterAdminProducts, productTitle, type AdminTab } from "@/lib/domain/admin-products";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { setPromo, setVisibility } from "./actions";
import { KpiCards } from "./KpiCards";
import { ProductFilters } from "./ProductFilters";
import { ProductsTable } from "./ProductsTable";

const TABS: AdminTab[] = ["todos", "visiveis", "ocultos"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [rows, orders30, categories] = await Promise.all([
    loadAdminProducts(supabase),
    countOrdersLast30Days(supabase),
    loadCategories(supabase),
  ]);

  const tab = TABS.includes(one(sp.aba) as AdminTab) ? (one(sp.aba) as AdminTab) : "todos";
  const result = filterAdminProducts(rows, {
    tab,
    query: one(sp.q),
    categoryId: one(sp.categoria),
    page: Number(one(sp.pagina)) || 1,
  });

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const k of ["aba", "q", "categoria"]) if (one(sp[k])) next.set(k, one(sp[k]));
    next.set("pagina", String(page));
    return `/admin/produtos?${next}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        actions={
          <>
            <a
              href="/produtos"
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center rounded-xl border border-line bg-white px-5 font-semibold text-ink hover:border-ink"
            >
              Ver no site
            </a>
            <Link
              href="/admin/produtos/novo"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-gold"
            >
              <span aria-hidden>+</span> Novo produto
            </Link>
          </>
        }
      />
      <KpiCards kpis={adminKpis(rows, orders30)} />

      <section aria-label="Lista de produtos" className="overflow-hidden rounded-2xl border border-line-soft bg-white">
        <ProductFilters categories={categories} />
        {rows.length === 0 ? (
          <Empty text="Nenhum produto cadastrado ainda." href="/admin/produtos/novo" cta="Novo produto" />
        ) : result.total === 0 ? (
          <Empty text="Nenhum produto encontrado." href="/admin/produtos" cta="Limpar filtros" />
        ) : (
          <ProductsTable
            rows={result.items}
            toggle={(r, field) => (
              <RowToggle
                key={`${r.id}-${field}-${r[field]}`}
                initial={r[field]}
                label={`${field === "isPromo" ? "Em oferta" : "Visível no site"}: ${productTitle(r.brandName, r.name)}`}
                action={(field === "isPromo" ? setPromo : setVisibility).bind(null, r.id)}
              />
            )}
          />
        )}
        {result.total > 0 && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-4 text-[15px] text-muted">
            <span>{result.label}</span>
            <span className="flex items-center gap-3">
              {result.page > 1 && (
                <Link href={pageHref(result.page - 1)} className="font-semibold text-ink underline">
                  Anterior
                </Link>
              )}
              {result.pageLabel}
              {result.page < result.pages && (
                <Link href={pageHref(result.page + 1)} className="font-semibold text-ink underline">
                  Próxima
                </Link>
              )}
            </span>
          </footer>
        )}
      </section>
    </>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <p className="text-muted">{text}</p>
      <Link href={href} className="inline-flex h-11 items-center rounded-xl bg-ink px-5 font-semibold text-gold">
        {cta}
      </Link>
    </div>
  );
}
