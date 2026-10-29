import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toInputBRL } from "@/lib/domain/money";
import { PRODUCT_TYPES, type ProductFormValues, type ProductType } from "@/lib/domain/product-input";

type Row = {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  sku: string | null;
  stock: number;
  specs: Record<string, string>;
  is_visible: boolean;
  is_promo: boolean;
  is_featured: boolean;
  variants: { label: string; price: number; promo_price: number | null; position: number }[];
  images: { path: string; is_cover: boolean; position: number }[];
};

/** Produto do banco no formato do formulário; null quando não existe. */
export async function loadProductForm(supabase: SupabaseClient, id: string): Promise<ProductFormValues | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, brand_id, category_id, description, sku, stock, specs, is_visible, is_promo, is_featured, " +
        "variants:product_variants(label, price, promo_price, position), images:product_images(path, is_cover, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as unknown as Row;
  const type = PRODUCT_TYPES.includes(r.specs.type as ProductType) ? (r.specs.type as ProductType) : "";
  return {
    id: r.id,
    name: r.name,
    brandId: r.brand_id,
    categoryId: r.category_id,
    description: r.description,
    sku: r.sku ?? "",
    stock: String(r.stock),
    variants: [...r.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        label: v.label,
        price: toInputBRL(Number(v.price)),
        promoPrice: toInputBRL(v.promo_price === null ? null : Number(v.promo_price)),
      })),
    images: [...r.images].sort((a, b) => a.position - b.position).map((i) => ({ path: i.path, isCover: i.is_cover })),
    specs: {
      viscosity: r.specs.viscosity ?? "",
      type,
      api: r.specs.api ?? "",
      application: r.specs.application ?? "",
    },
    isVisible: r.is_visible,
    isPromo: r.is_promo,
    isFeatured: r.is_featured,
  };
}

export async function loadBrandOptions(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("brands").select("id, name").order("name");
  if (error) throw error;
  return data;
}
