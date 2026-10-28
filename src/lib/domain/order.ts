import { productTitle, type VariantRow } from "./admin-products";
import type { CartLine } from "./cart";
import { variantPrice } from "./catalog";
import { formatBRL } from "./money";
import { whatsappLink } from "./settings-input";

/** Um produto visível com as embalagens, como o servidor lê do banco. */
export type PriceRow = { id: string; brandName: string; name: string; isPromo: boolean; variants: VariantRow[] };

/** Item com o preço atual: `regular` é o preço normal riscado quando há oferta. */
export type PricedLine = CartLine & { price: number; regular: number | null; subtotal: number };
export type CartQuote = { items: PricedLine[]; unavailable: CartLine[]; total: number };

const cents = (v: number) => Math.round(v * 100);

/**
 * Preço de cada linha pelo banco (spec, Assumptions): promocional só com a
 * oferta ligada; produto que não veio (oculto ou removido) ou embalagem que
 * saiu do cadastro fica indisponível e fora do total.
 */
export function priceCart(lines: CartLine[], rows: PriceRow[]): CartQuote {
  const items: PricedLine[] = [];
  const unavailable: CartLine[] = [];
  for (const l of lines) {
    const row = rows.find((r) => r.id === l.productId);
    const variant = row?.variants.find((v) => v.label === l.label);
    if (!row || !variant) {
      unavailable.push(l);
      continue;
    }
    const p = variantPrice(row.isPromo, variant);
    items.push({
      ...l,
      title: productTitle(row.brandName, row.name),
      price: p.price,
      regular: p.regular,
      subtotal: (cents(p.price) * l.qty) / 100,
    });
  }
  const total = items.reduce((sum, i) => sum + cents(i.subtotal), 0) / 100;
  return { items, unavailable, total };
}

export function unavailableNotice(n: number): string {
  if (n <= 0) return "";
  return n === 1 ? "1 item indisponível ficou de fora." : `${n} itens indisponíveis ficaram de fora.`;
}

export const ORDER_MESSAGES = {
  length: "Use até 80 caracteres no nome e 40 no veículo.",
  invalid: "Não foi possível enviar o pedido. Revise o carrinho e tente de novo.",
  rateLimited: "Muitos pedidos seguidos. Espere alguns minutos ou fale direto no WhatsApp.",
  sent: "Pedido enviado! Termine a conversa no WhatsApp.",
} as const;

export const ORDER_MAX_LINES = 30;
export const NAME_MAX = 80;
export const VEHICLE_MAX = 40;

export type OrderInput = {
  lines: { productId: string; label: string; qty: number }[];
  name: string;
  vehicle: string;
  coupon: boolean;
  sourceUrl: string;
};

const isQty = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 99;
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** O que o navegador manda em `POST /api/pedidos` (CART-04 AC 8 e 9). */
export function validateOrderInput(body: unknown): { ok: true; value: OrderInput } | { ok: false; message: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = text(b.name);
  const vehicle = text(b.vehicle);
  if (name.length > NAME_MAX || vehicle.length > VEHICLE_MAX) return { ok: false, message: ORDER_MESSAGES.length };
  const lines = b.lines;
  const validLines =
    Array.isArray(lines) &&
    lines.length >= 1 &&
    lines.length <= ORDER_MAX_LINES &&
    lines.every((l) => l && typeof l.productId === "string" && typeof l.label === "string" && l.label !== "" && isQty(l.qty));
  if (!validLines) return { ok: false, message: ORDER_MESSAGES.invalid };
  return {
    ok: true,
    value: {
      lines: (lines as OrderInput["lines"]).map((l) => ({ productId: l.productId, label: l.label, qty: l.qty })),
      name,
      vehicle,
      coupon: b.coupon === true,
      sourceUrl: text(b.sourceUrl).slice(0, 500),
    },
  };
}

type MessageItem = { title: string; label: string; qty: number; price: number; subtotal: number };

/** O "Modelo da mensagem" de CART-04; linhas vazias somem (AC 3) e, sem número, o trecho do pedido também (AC 12). */
export function orderMessage(o: {
  number: number | null;
  items: MessageItem[];
  total: number;
  name: string;
  vehicle: string;
  coupon: string | null;
}): string {
  const head = o.number ? `Olá! Quero fazer este pedido pelo site (Pedido nº ${o.number}):` : "Olá! Quero fazer este pedido pelo site:";
  const lines = o.items.map((i) => `- ${i.title} · ${i.label} · ${i.qty} x ${formatBRL(i.price)} = ${formatBRL(i.subtotal)}`);
  const tail = [`Total estimado: ${formatBRL(o.total)}`];
  if (o.name.trim()) tail.push(`Nome: ${o.name.trim()}`);
  if (o.vehicle.trim()) tail.push(`Veículo: ${o.vehicle.trim()}`);
  if (o.coupon) tail.push(`Cupom: ${o.coupon} (troca na loja)`);
  return [head, "", ...lines, "", ...tail].join("\n");
}

export const orderWhatsappLink = (whatsapp: string, message: string) => whatsappLink(whatsapp, message);
