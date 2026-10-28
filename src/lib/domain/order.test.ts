import { describe, expect, it } from "vitest";
import type { CartLine } from "./cart";
import { priceCart, unavailableNotice, type PriceRow } from "./order";

const line = (productId: string, label: string, qty: number): CartLine => ({
  productId,
  slug: productId,
  title: `Título ${productId}`,
  label,
  qty,
});

const topTurbo: PriceRow = {
  id: "top",
  brandName: "Lubrax",
  name: "Top Turbo 15W-40",
  isPromo: true,
  variants: [
    { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
    { label: "Frasco 1L", price: 39.9, promoPrice: null },
  ],
};
const rimula: PriceRow = {
  id: "rimula",
  brandName: "Shell",
  name: "Rimula R4 15W-40",
  isPromo: false,
  variants: [{ label: "Balde 20L", price: 459.9, promoPrice: 419.9 }],
};

describe("preço do carrinho", () => {
  it("CART-04.5: preço do banco, com o promocional só em oferta ativa, e total com centavos exatos", () => {
    const quote = priceCart([line("top", "Balde 20L", 2), line("top", "Frasco 1L", 3), line("rimula", "Balde 20L", 1)], [topTurbo, rimula]);
    expect(quote.items).toEqual([
      { productId: "top", slug: "top", title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2, price: 349.9, regular: 389.9, subtotal: 699.8 },
      { productId: "top", slug: "top", title: "Lubrax Top Turbo 15W-40", label: "Frasco 1L", qty: 3, price: 39.9, regular: null, subtotal: 119.7 },
      // Rimula tem promocional cadastrado, mas a oferta está desligada
      { productId: "rimula", slug: "rimula", title: "Shell Rimula R4 15W-40", label: "Balde 20L", qty: 1, price: 459.9, regular: null, subtotal: 459.9 },
    ]);
    expect(quote.total).toBe(1279.4);
    expect(quote.unavailable).toEqual([]);
  });

  it("produto oculto ou removido e embalagem que saiu do cadastro ficam indisponíveis e fora do total", () => {
    const quote = priceCart(
      [line("top", "Frasco 1L", 1), line("sumiu", "Balde 20L", 2), line("top", "Tambor 200L", 1)],
      [topTurbo],
    );
    expect(quote.items.map((i) => i.label)).toEqual(["Frasco 1L"]);
    expect(quote.unavailable).toEqual([line("sumiu", "Balde 20L", 2), line("top", "Tambor 200L", 1)]);
    expect(quote.total).toBe(39.9);
  });

  it("o preço que mudou desde a adição vale o novo", () => {
    const before = priceCart([line("top", "Frasco 1L", 1)], [topTurbo]).items[0].price;
    const changed = { ...topTurbo, variants: [{ label: "Frasco 1L", price: 42.5, promoPrice: null }] };
    expect(before).toBe(39.9);
    expect(priceCart([line("top", "Frasco 1L", 1)], [changed]).items[0].price).toBe(42.5);
  });

  it("aviso de itens indisponíveis no singular e no plural", () => {
    expect(unavailableNotice(1)).toBe("1 item indisponível ficou de fora.");
    expect(unavailableNotice(2)).toBe("2 itens indisponíveis ficaram de fora.");
    expect(unavailableNotice(0)).toBe("");
  });
});
