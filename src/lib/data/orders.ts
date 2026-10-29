import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartLine } from "@/lib/domain/cart";
import type { PriceRow } from "@/lib/domain/order";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = {
  id: string;
  name: string;
  is_promo: boolean;
  brand: { name: string } | null;
  variants: { label: string; price: number | string; promo_price: number | string | null; position: number }[];
};

/** Produtos visíveis das linhas, com as embalagens; o que não vier fica indisponível. */
export async function loadPriceRows(supabase: SupabaseClient, lines: Pick<CartLine, "productId">[]): Promise<PriceRow[]> {
  const ids = [...new Set(lines.map((l) => l.productId).filter((id) => UUID_RE.test(id)))];
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select("id, name, is_promo, brand:brands(name), variants:product_variants(label, price, promo_price, position)")
    .in("id", ids)
    .eq("is_visible", true);
  if (error) throw error;
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    name: r.name,
    brandName: r.brand?.name ?? "",
    isPromo: r.is_promo,
    variants: [...r.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ label: v.label, price: Number(v.price), promoPrice: v.promo_price === null ? null : Number(v.promo_price) })),
  }));
}
