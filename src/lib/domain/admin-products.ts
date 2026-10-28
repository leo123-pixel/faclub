import { matchesSearch } from "./search";

export const PAGE_SIZE = 20;
export const LOW_STOCK = 5;

export type VariantRow = { label: string; price: number; promoPrice: number | null };

export type AdminProductRow = {
  id: string;
  name: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  sku: string | null;
  stock: number;
  isVisible: boolean;
  isPromo: boolean;
  isFeatured: boolean;
  coverPath: string | null;
  /** Na ordem de `position`. */
  variants: VariantRow[];
};

export type AdminTab = "todos" | "visiveis" | "ocultos";
export type AdminFilters = { tab: AdminTab; query: string; categoryId: string; page: number };

export type AdminPage = {
  items: AdminProductRow[];
  total: number;
  page: number;
  pages: number;
  label: string;
  pageLabel: string;
};

/** Aba, busca (nome, marca, SKU) e categoria, depois a página de 20. */
export function filterAdminProducts(rows: AdminProductRow[], f: AdminFilters, pageSize = PAGE_SIZE): AdminPage {
  const filtered = rows.filter(
    (r) =>
      (f.tab === "todos" || (f.tab === "visiveis" ? r.isVisible : !r.isVisible)) &&
      (!f.categoryId || r.categoryId === f.categoryId) &&
      matchesSearch([r.name, r.brandName, r.sku], f.query),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(f.page) || 1), pages);
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    items,
    total: filtered.length,
    page,
    pages,
    label: `${items.length} de ${filtered.length} produtos`,
    pageLabel: `Página ${page} de ${pages}`,
  };
}

export type AdminKpis = { active: number; promo: number; lowStock: number; orders30: number };

export function adminKpis(rows: AdminProductRow[], ordersLast30: number): AdminKpis {
  return {
    active: rows.filter((r) => r.isVisible).length,
    promo: rows.filter((r) => r.isVisible && r.isPromo).length,
    lowStock: rows.filter((r) => r.stock <= LOW_STOCK).length,
    orders30: ordersLast30,
  };
}

export function stockLabel(stock: number): { text: string; low: boolean } {
  const low = stock <= LOW_STOCK;
  return { text: low ? `Baixo · ${stock}` : `${stock} un.`, low };
}

/** Preço da primeira embalagem; o rótulo vira "N embalagens" quando há mais de uma. */
export function displayVariant(p: Pick<AdminProductRow, "variants">): VariantRow {
  const first = p.variants[0] ?? { label: "", price: 0, promoPrice: null };
  const label = p.variants.length > 1 ? `${p.variants.length} embalagens` : first.label;
  return { label, price: first.price, promoPrice: first.promoPrice };
}
