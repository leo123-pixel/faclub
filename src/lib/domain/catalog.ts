import { productTitle, type VariantRow } from "./admin-products";
import { matchesSearch } from "./search";

/** Produtos por carga do catálogo; "Carregar mais" traz outros tantos. */
export const CATALOG_PAGE = 12;

/** Um produto visível como o site o mostra no card e usa na busca. */
export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  sku: string | null;
  viscosity: string;
  application: string;
  isPromo: boolean;
  isFeatured: boolean;
  stock: number;
  coverPath: string | null;
  /** Na ordem de `position`. */
  variants: VariantRow[];
};

/** A linha de `products` com marca, categoria, embalagens e fotos, como o Supabase devolve. */
export type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  stock: number;
  is_promo: boolean;
  is_featured: boolean;
  specs: Partial<Record<"viscosity" | "type" | "api" | "application", string>> | null;
  brand: { name: string } | null;
  category: { slug: string; name: string } | null;
  variants: { label: string; price: number | string; promo_price: number | string | null; position: number }[];
  images: { path: string; is_cover: boolean; position: number }[];
};

export const CATALOG_SELECT =
  "id, slug, name, sku, stock, is_promo, is_featured, specs, brand:brands(name), category:categories(slug, name), " +
  "variants:product_variants(label, price, promo_price, position), images:product_images(path, is_cover, position)";

export function coverOf(images: CatalogRow["images"]): string | null {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  return (sorted.find((i) => i.is_cover) ?? sorted[0])?.path ?? null;
}

export function toCatalogItem(r: CatalogRow): CatalogItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brandName: r.brand?.name ?? "",
    categorySlug: r.category?.slug ?? "",
    categoryName: r.category?.name ?? "",
    sku: r.sku,
    viscosity: r.specs?.viscosity ?? "",
    application: r.specs?.application ?? "",
    isPromo: r.is_promo,
    isFeatured: r.is_featured,
    stock: r.stock,
    coverPath: coverOf(r.images),
    variants: [...r.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ label: v.label, price: Number(v.price), promoPrice: v.promo_price === null ? null : Number(v.promo_price) })),
  };
}

/** Preço de uma embalagem: o promocional só vale com a oferta ligada; `regular` é o preço riscado. */
export function variantPrice(isPromo: boolean, v: VariantRow): { label: string; price: number; regular: number | null } {
  if (isPromo && v.promoPrice !== null) return { label: v.label, price: v.promoPrice, regular: v.price };
  return { label: v.label, price: v.price, regular: null };
}

/** O card mostra a primeira embalagem. */
export function cardPrice(item: Pick<CatalogItem, "isPromo" | "variants">) {
  return variantPrice(item.isPromo, item.variants[0] ?? { label: "", price: 0, promoPrice: null });
}

export type CatalogFilters = { category: string; query: string };

export function filterCatalog(items: CatalogItem[], f: CatalogFilters): CatalogItem[] {
  return items.filter(
    (i) =>
      (!f.category || i.categorySlug === f.category) &&
      matchesSearch([i.name, i.brandName, i.categoryName, i.viscosity, i.application, i.sku], f.query),
  );
}

export const SORTS = [
  { value: "destaques", label: "Destaques" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "a-z", label: "A–Z" },
] as const;

export type CatalogSort = (typeof SORTS)[number]["value"];

export const isCatalogSort = (v: string | null | undefined): v is CatalogSort =>
  SORTS.some((s) => s.value === v);

const title = (i: CatalogItem) => productTitle(i.brandName, i.name);
const byTitle = (a: CatalogItem, b: CatalogItem) => title(a).localeCompare(title(b), "pt-BR");

/** Devolve uma lista nova; empates de preço e de destaque seguem A–Z. */
export function sortCatalog(items: CatalogItem[], sort: CatalogSort): CatalogItem[] {
  const price = (i: CatalogItem) => cardPrice(i).price;
  const list = [...items];
  switch (sort) {
    case "menor-preco":
      return list.sort((a, b) => price(a) - price(b) || byTitle(a, b));
    case "maior-preco":
      return list.sort((a, b) => price(b) - price(a) || byTitle(a, b));
    case "a-z":
      return list.sort(byTitle);
    case "destaques":
      return list.sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isPromo) - Number(a.isPromo) || byTitle(a, b),
      );
  }
}

export const productCountLabel = (n: number) => (n === 1 ? "1 produto" : `${n} produtos`);
