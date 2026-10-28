"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CATALOG_PAGE,
  filterCatalog,
  isCatalogSort,
  productCountLabel,
  sortCatalog,
  SORTS,
  type CatalogItem,
  type CatalogSort,
} from "@/lib/domain/catalog";
import { IconSearch } from "./icons";
import { ProductCard } from "./ProductCard";

type Category = { slug: string; name: string };
type Filters = { category: string; query: string; sort: CatalogSort };
type Props = { categories: Category[]; items: CatalogItem[]; contactHref: string };

export const EMPTY_CATALOG = "Nenhum produto encontrado. Tente outra busca ou fale com a gente no WhatsApp.";
const DEFAULT: Filters = { category: "", query: "", sort: "destaques" };

/** Estado do catálogo na URL: `?categoria=`, `?q=` e `?ordem=`; os padrões ficam de fora. */
function writeUrl(f: Filters) {
  const params = new URLSearchParams();
  if (f.category) params.set("categoria", f.category);
  if (f.query) params.set("q", f.query);
  if (f.sort !== DEFAULT.sort) params.set("ordem", f.sort);
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

/** Lê os filtros da URL; precisa de um `<Suspense>` acima (a página é pré-gerada). */
export function CatalogFromUrl(props: Props) {
  const params = useSearchParams();
  const category = params.get("categoria") ?? "";
  const sort = params.get("ordem");
  const initial: Filters = {
    category: props.categories.some((c) => c.slug === category) ? category : "",
    query: params.get("q") ?? "",
    sort: isCatalogSort(sort) ? sort : DEFAULT.sort,
  };
  return <CatalogBrowser {...props} initial={initial} />;
}

/** Filtro, busca, ordem e "Carregar mais" sem recarregar a página (CAT-01). */
export function CatalogBrowser({ categories, items, contactHref, initial = DEFAULT }: Props & { initial?: Filters }) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [shown, setShown] = useState(CATALOG_PAGE);

  const list = useMemo(
    () => sortCatalog(filterCatalog(items, { category: filters.category, query: filters.query }), filters.sort),
    [items, filters],
  );

  function update(next: Partial<Filters>) {
    const f = { ...filters, ...next };
    setFilters(f);
    setShown(CATALOG_PAGE);
    writeUrl(f);
  }

  const chip = (active: boolean) =>
    `h-10 shrink-0 rounded-full px-[18px] text-[15px] font-medium transition-colors ${
      active ? "bg-ink text-white" : "text-[#3A4157] hover:text-ink"
    }`;

  return (
    <div>
      <div className="mt-12 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Categorias"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-bg p-[5px] [scrollbar-width:none]"
        >
          <button type="button" aria-pressed={filters.category === ""} className={chip(filters.category === "")} onClick={() => update({ category: "" })}>
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={filters.category === c.slug}
              className={chip(filters.category === c.slug)}
              onClick={() => update({ category: c.slug })}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex gap-[10px]">
          <label className="relative flex h-12 min-w-0 flex-1 items-center rounded-full border border-line-soft px-4 focus-within:border-ink lg:w-[292px] lg:flex-none">
            <span className="sr-only">Buscar produtos</span>
            <IconSearch className="mr-2 shrink-0 text-muted" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="Marca, viscosidade, aplicação"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Ordenar</span>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as CatalogSort })}
              className="h-12 rounded-full border border-line-soft bg-white px-5 text-[15px] text-ink outline-none focus:border-ink"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-[14px] text-muted">
        {productCountLabel(list.length)}
      </p>

      {list.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mx-auto max-w-[420px] text-[17px] leading-relaxed text-ink">{EMPTY_CATALOG}</p>
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-white hover:bg-navy-2"
          >
            Chamar no WhatsApp
          </a>
        </div>
      ) : (
        <>
          <ul aria-label="Produtos" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {list.slice(0, shown).map((item) => (
              <li key={item.id}>
                <ProductCard item={item} />
              </li>
            ))}
          </ul>
          {list.length > shown && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + CATALOG_PAGE)}
                className="h-12 rounded-full border border-line-soft px-7 text-[15px] font-semibold text-ink hover:bg-bg"
              >
                Carregar mais
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
