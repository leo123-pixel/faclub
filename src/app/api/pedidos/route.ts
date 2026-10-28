import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { loadPriceRows } from "@/lib/data/orders";
import type { CartLine } from "@/lib/domain/cart";
import { activeCoupon, type CouponRow } from "@/lib/domain/home";
import { ORDER_MESSAGES, priceCart, validateOrderInput } from "@/lib/domain/order";
import { createPublicSupabase } from "@/lib/supabase/public";
import { createServiceSupabase } from "@/lib/supabase/service";

/** Chave do limite de envios: HMAC do IP com o segredo do servidor; o IP não vai ao banco. */
function throttleKey(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(ip).digest("hex");
}

/**
 * Grava o pedido com o preço do banco e devolve o número (CART-04 AC 4 a 9,
 * 11 e 14). A mensagem do WhatsApp é montada no navegador com esta resposta.
 */
export async function POST(request: NextRequest) {
  const checked = validateOrderInput(await request.json().catch(() => null));
  if (!checked.ok) return Response.json({ error: checked.message }, { status: 400 });
  const input = checked.value;

  const service = createServiceSupabase();
  const slot = await service.rpc("take_order_slot", { p_key: throttleKey(request) });
  if (slot.error) throw slot.error;
  if (slot.data !== true) return Response.json({ error: ORDER_MESSAGES.rateLimited }, { status: 429 });

  const publicDb = createPublicSupabase();
  const lines: CartLine[] = input.lines.map((l) => ({ ...l, slug: "", title: "" }));
  const quote = priceCart(lines, await loadPriceRows(publicDb, lines));
  if (quote.items.length === 0) {
    return Response.json({ error: ORDER_MESSAGES.invalid, unavailable: quote.unavailable }, { status: 400 });
  }

  let coupon: string | null = null;
  if (input.coupon) {
    const { data, error } = await publicDb.from("coupons").select("code, percent, is_active, created_at");
    if (error) throw error;
    coupon = activeCoupon(data as CouponRow[])?.code ?? null;
  }

  const items = quote.items.map((i) => ({
    productId: i.productId,
    title: i.title,
    label: i.label,
    qty: i.qty,
    price: i.price,
    subtotal: i.subtotal,
  }));
  const { data, error } = await service
    .from("orders")
    .insert({
      items,
      total_estimated: quote.total,
      customer_name: input.name || null,
      vehicle: input.vehicle || null,
      coupon_code: coupon,
      status: "Novo",
      source_url: input.sourceUrl || null,
    })
    .select("id")
    .single();
  if (error) throw error;

  return Response.json({ number: data.id, items, total: quote.total, unavailable: quote.unavailable, coupon });
}
