import { productTitle, type VariantRow } from "./admin-products";
import { variantPrice } from "./catalog";

/** Um evento de medição (CONS-01 AC 5 a 10), com os mesmos nomes no GA4 e no Pixel. */
export type AnalyticsEvent = { name: string; params: Record<string, string | number> };

export const WHATSAPP_LOCATIONS = ["topo", "banner", "servicos", "contato", "catalogo_vazio"] as const;
export type WhatsappLocation = (typeof WHATSAPP_LOCATIONS)[number];

type ViewedProduct = { id: string; name: string; brandName: string; isPromo: boolean; variants: VariantRow[] };

export function viewItemEvent(p: ViewedProduct): AnalyticsEvent {
  const first = p.variants[0];
  return {
    name: "view_item",
    params: {
      item_id: p.id,
      item_name: productTitle(p.brandName, p.name),
      item_brand: p.brandName,
      price: first ? variantPrice(p.isPromo, first).price : 0,
      currency: "BRL",
    },
  };
}

export function addToCartEvent(line: { productId: string; title: string; label: string; qty: number }, price: number): AnalyticsEvent {
  return {
    name: "add_to_cart",
    params: { item_id: line.productId, item_name: line.title, item_variant: line.label, quantity: line.qty, price, currency: "BRL" },
  };
}

export function sendOrderEvent(items: { qty: number }[], total: number): AnalyticsEvent {
  return { name: "send_order_whatsapp", params: { items: items.reduce((n, i) => n + i.qty, 0), value: total, currency: "BRL" } };
}

export const clickWhatsappEvent = (location: WhatsappLocation): AnalyticsEvent => ({ name: "click_whatsapp", params: { location } });
export const copyCouponEvent = (code: string): AnalyticsEvent => ({ name: "copy_coupon", params: { coupon: code } });
export const joinGroupEvent = (): AnalyticsEvent => ({ name: "join_group", params: {} });
