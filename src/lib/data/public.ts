import "server-only";
import { cache } from "react";
import { CATALOG_SELECT, coverOf, toCatalogItem, type CatalogItem, type CatalogRow } from "@/lib/domain/catalog";
import { activeBanner, activeCoupon, type BannerRow, type CouponRow } from "@/lib/domain/home";
import type { ProductDetail } from "@/lib/domain/product-page";
import { withDefaults, type SettingsRow } from "@/lib/domain/site-settings";
import { createPublicSupabase } from "@/lib/supabase/public";

// Cada carregador lança erro quando a consulta falha: o Next mantém a última
// versão gerada da página e tenta de novo na próxima revalidação.

export const loadSettings = cache(async () => {
  const { data, error } = await createPublicSupabase()
    .from("settings")
    .select("whatsapp, phone, email, address, hours_weekdays, hours_saturday, group_link, instagram, schedule_message")
    .maybeSingle();
  if (error) throw error;
  return withDefaults(data as SettingsRow | null);
});

export const loadCoupon = cache(async () => {
  const { data, error } = await createPublicSupabase().from("coupons").select("code, percent, is_active, created_at");
  if (error) throw error;
  return activeCoupon(data as CouponRow[]);
});

/** Produtos visíveis, na ordem de cadastro. */
export const loadVisibleProducts = cache(async (): Promise<CatalogItem[]> => {
  const { data, error } = await createPublicSupabase()
    .from("products")
    .select(CATALOG_SELECT)
    .eq("is_visible", true)
    .order("created_at")
    .order("name");
  if (error) throw error;
  return (data as unknown as CatalogRow[]).map(toCatalogItem);
});

export async function loadHomeData() {
  const supabase = createPublicSupabase();
  const [banners, brands, items, coupon] = await Promise.all([
    supabase.from("banners").select("image_path, title, subtitle, link, is_active, position"),
    supabase.from("brands").select("name, logo_path").order("created_at").order("name"),
    loadVisibleProducts(),
    loadCoupon(),
  ]);
  if (banners.error) throw banners.error;
  if (brands.error) throw brands.error;
  return {
    hero: activeBanner(banners.data as BannerRow[]),
    brands: brands.data as { name: string; logo_path: string | null }[],
    items,
    coupon,
  };
}

export async function loadCatalog() {
  const [categories, items] = await Promise.all([
    createPublicSupabase().from("categories").select("slug, name").order("position").order("name"),
    loadVisibleProducts(),
  ]);
  if (categories.error) throw categories.error;
  return { categories: categories.data as { slug: string; name: string }[], items };
}

type DetailRow = CatalogRow & { description: string; is_featured: boolean };

/** O produto visível do slug, ou null quando não existe ou está oculto. */
export const loadProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const { data, error } = await createPublicSupabase()
    .from("products")
    .select(`${CATALOG_SELECT}, description`)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as DetailRow;
  const item = toCatalogItem(row);
  const cover = coverOf(row.images);
  const rest = [...row.images].sort((a, b) => a.position - b.position).map((i) => i.path).filter((p) => p !== cover);
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brandName: item.brandName,
    categorySlug: item.categorySlug,
    categoryName: item.categoryName,
    sku: item.sku,
    stock: item.stock,
    isPromo: item.isPromo,
    isFeatured: item.isFeatured,
    variants: item.variants,
    description: row.description,
    specs: row.specs ?? {},
    images: cover ? [cover, ...rest] : [],
  };
});
