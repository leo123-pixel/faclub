import { describe, expect, it } from "vitest";
import {
  addToCartEvent,
  clickWhatsappEvent,
  copyCouponEvent,
  joinGroupEvent,
  sendOrderEvent,
  viewItemEvent,
  WHATSAPP_LOCATIONS,
} from "./analytics-events";

const topTurbo = {
  id: "top",
  name: "Top Turbo 15W-40",
  brandName: "Lubrax",
  isPromo: true,
  variants: [
    { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
    { label: "Frasco 1L", price: 39.9, promoPrice: null },
  ],
};

describe("eventos de medição", () => {
  it("view_item: id, nome, marca e preço da primeira embalagem, com o promocional só em oferta", () => {
    expect(viewItemEvent(topTurbo)).toEqual({
      name: "view_item",
      params: { item_id: "top", item_name: "Lubrax Top Turbo 15W-40", item_brand: "Lubrax", price: 349.9, currency: "BRL" },
    });
    expect(viewItemEvent({ ...topTurbo, isPromo: false }).params.price).toBe(389.9);
  });

  it("add_to_cart: id, embalagem, quantidade e preço", () => {
    expect(addToCartEvent({ productId: "top", title: "Lubrax Top Turbo 15W-40", label: "Frasco 1L", qty: 2 }, 39.9)).toEqual({
      name: "add_to_cart",
      params: { item_id: "top", item_name: "Lubrax Top Turbo 15W-40", item_variant: "Frasco 1L", quantity: 2, price: 39.9, currency: "BRL" },
    });
  });

  it("send_order_whatsapp: número de itens (soma das quantidades) e total estimado", () => {
    expect(sendOrderEvent([{ qty: 2 }, { qty: 1 }], 759.7)).toEqual({
      name: "send_order_whatsapp",
      params: { items: 3, value: 759.7, currency: "BRL" },
    });
  });

  it("click_whatsapp: o local do botão", () => {
    expect(WHATSAPP_LOCATIONS).toEqual(["topo", "banner", "servicos", "contato", "catalogo_vazio"]);
    expect(clickWhatsappEvent("banner")).toEqual({ name: "click_whatsapp", params: { location: "banner" } });
  });

  it("copy_coupon: o código", () => {
    expect(copyCouponEvent("FACLUB10")).toEqual({ name: "copy_coupon", params: { coupon: "FACLUB10" } });
  });

  it("join_group: sem parâmetros", () => {
    expect(joinGroupEvent()).toEqual({ name: "join_group", params: {} });
  });
});
