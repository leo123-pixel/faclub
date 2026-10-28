import type { NextRequest } from "next/server";
import { loadPriceRows } from "@/lib/data/orders";
import type { CartLine } from "@/lib/domain/cart";
import { priceCart, validateOrderInput } from "@/lib/domain/order";
import { createPublicSupabase } from "@/lib/supabase/public";

/** Preço atual de cada linha do carrinho e o que ficou indisponível (CART-01 AC 11). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const checked = validateOrderInput({ lines: body?.lines });
  if (!checked.ok) return Response.json({ error: checked.message }, { status: 400 });
  const sent = body.lines as Partial<CartLine>[];
  const lines: CartLine[] = checked.value.lines.map((l) => {
    const from = sent.find((s) => s.productId === l.productId && s.label === l.label);
    return { ...l, slug: typeof from?.slug === "string" ? from.slug : "", title: typeof from?.title === "string" ? from.title : "" };
  });
  const rows = await loadPriceRows(createPublicSupabase(), lines);
  return Response.json(priceCart(lines, rows));
}
