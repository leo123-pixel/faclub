import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminProductRow } from "@/lib/domain/admin-products";

type Row = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  is_visible: boolean;
  is_promo: boolean;
  is_featured: boolean;
  brand: { name: string } | null;
  category: { id: string; name: string } | null;
  variants: { label: string; price: number; promo_price: number | null; position: number }[];
  images: { path: string; is_cover: boolean }[];
};

const SELECT =
  "id, name, sku, stock, is_visible, is_promo, is_featured, brand:brands(name), category:categories(id, name), " +
  "variants:product_variants(label, price, promo_price, position), images:product_images(path, is_cover)";

export async function loadAdminProducts(supabase: SupabaseClient): Promise<AdminProductRow[]> {
  const { data, error } = await supabase.from("products").select(SELECT).order("created_at").order("name");
  if (error) throw error;
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    name: r.name,
    brandName: r.brand?.name ?? "",
    categoryId: r.category?.id ?? "",
    categoryName: r.category?.name ?? "",
    sku: r.sku,
    stock: r.stock,
    isVisible: r.is_visible,
    isPromo: r.is_promo,
    isFeatured: r.is_featured,
    coverPath: r.images.find((i) => i.is_cover)?.path ?? r.images[0]?.path ?? null,
    variants: [...r.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ label: v.label, price: Number(v.price), promoPrice: v.promo_price === null ? null : Number(v.promo_price) })),
  }));
}

export async function countOrdersLast30Days(supabase: SupabaseClient): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

export async function loadCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("position");
  if (error) throw error;
  return data;
}
