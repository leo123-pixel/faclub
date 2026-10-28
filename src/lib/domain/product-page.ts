import type { VariantRow } from "./admin-products";
import type { CatalogItem } from "./catalog";

/** Um produto visível com o que a página dele mostra. `images` vem com a capa primeiro. */
export type ProductDetail = Omit<CatalogItem, "viscosity" | "application" | "coverPath"> & {
  description: string;
  specs: Partial<Record<"viscosity" | "type" | "api" | "application", string>>;
  images: string[];
};

export const availability = (stock: number) => (stock > 0 ? "Pronta entrega" : "Sob consulta");

const SPEC_LABELS = [
  ["viscosity", "Viscosidade"],
  ["type", "Tipo"],
  ["api", "Especificação API"],
  ["application", "Aplicação"],
] as const;

/** Ficha técnica: campo vazio não vira linha; Disponibilidade sempre aparece. */
export function specRows(p: Pick<ProductDetail, "specs" | "sku" | "stock">): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = SPEC_LABELS.map(([key, label]) => ({ label, value: p.specs[key]?.trim() ?? "" }));
  rows.push({ label: "Código", value: p.sku?.trim() ?? "" });
  return [...rows.filter((r) => r.value), { label: "Disponibilidade", value: availability(p.stock) }];
}

/** "Balde 20L" vira "à vista · balde 20L". */
export const packageCaption = (label: string) => `à vista · ${label.charAt(0).toLowerCase()}${label.slice(1)}`;

const PACKAGE_ORDER = ["Frasco 1L", "Frasco 4L", "Balde 20L", "Tambor 200L", "Unidade"];

/** Os chips de embalagem vão do menor ao maior; as de nome livre ficam no fim, na ordem do cadastro. */
export function chipOrder(variants: VariantRow[]): VariantRow[] {
  const rank = (v: VariantRow) => {
    const i = PACKAGE_ORDER.indexOf(v.label);
    return i === -1 ? PACKAGE_ORDER.length : i;
  };
  return variants.map((v, i) => ({ v, i })).sort((a, b) => rank(a.v) - rank(b.v) || a.i - b.i).map(({ v }) => v);
}

export const RELATED_LIMIT = 4;

/** "Combine com": produtos de outras categorias, destaques primeiro, até 4. */
export function relatedProducts(product: Pick<ProductDetail, "id" | "categorySlug">, items: CatalogItem[]): CatalogItem[] {
  return items
    .filter((i) => i.id !== product.id && i.categorySlug !== product.categorySlug)
    .map((item, index) => ({ item, index }))
    .sort((a, b) => Number(b.item.isFeatured) - Number(a.item.isFeatured) || a.index - b.index)
    .map(({ item }) => item)
    .slice(0, RELATED_LIMIT);
}
