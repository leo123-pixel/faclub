"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "visiveis", label: "Visíveis" },
  { value: "ocultos", label: "Ocultos" },
] as const;

/** Abas, busca e categoria: mudam a URL sem recarregar a página. */
export function ProductFilters({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const tab = params.get("aba") ?? "todos";

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("pagina");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: query.trim() }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao texto digitado
  }, [query]);

  return (
    <div className="flex flex-col gap-3 border-b border-line-soft p-4 lg:flex-row lg:items-center lg:p-5">
      <div role="tablist" aria-label="Situação" className="inline-flex w-fit rounded-xl bg-bg p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={tab === t.value}
            onClick={() => update({ aba: t.value === "todos" ? "" : t.value })}
            className={`h-9 rounded-lg px-4 text-sm font-semibold ${
              tab === t.value ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produto ou SKU"
          aria-label="Buscar produto ou SKU"
          className="h-11 rounded-lg border border-line px-4 text-[15px] outline-none focus:border-ink sm:w-60"
        />
        <select
          aria-label="Categoria"
          value={params.get("categoria") ?? ""}
          onChange={(e) => update({ categoria: e.target.value })}
          className="h-11 rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
