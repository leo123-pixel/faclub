import { productTitle, type VariantRow } from "./admin-products";
import type { CartLine } from "./cart";
import { variantPrice } from "./catalog";

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
