import { describe, expect, it } from "vitest";
import { addToCart, cartCount, EMPTY_CART, readCart, removeLine, setQty, writeCart, type CartLine } from "./cart";

const NOW = new Date("2026-10-28T12:00:00Z");
const line = (over: Partial<CartLine> = {}): CartLine => ({
  productId: "p1",
  slug: "top-turbo-15w-40",
  title: "Lubrax Top Turbo 15W-40",
  label: "Balde 20L",
  qty: 1,
  ...over,
});
const later = (ms: number) => new Date(NOW.getTime() + ms);
const DAY = 24 * 60 * 60 * 1000;

describe("carrinho", () => {
  it("CART-01.3: o mesmo produto e embalagem somam na quantidade, até 99", () => {
    let cart = addToCart(EMPTY_CART, line({ qty: 2 }), NOW);
    cart = addToCart(cart, line({ qty: 3 }), NOW);
    expect(cart.lines).toEqual([line({ qty: 5 })]);
    // outra embalagem do mesmo produto vira outra linha
    cart = addToCart(cart, line({ label: "Frasco 1L", qty: 1 }), NOW);
    expect(cart.lines.map((l) => [l.label, l.qty])).toEqual([
      ["Balde 20L", 5],
      ["Frasco 1L", 1],
    ]);
    // a soma para em 99
    cart = addToCart(cart, line({ qty: 94 }), NOW);
    expect(cart.lines[0].qty).toBe(99);
    cart = addToCart(cart, line({ qty: 1 }), NOW);
    expect(cart.lines[0].qty).toBe(99);
  });

  it("CART-01.8: depois de 7 dias sem alteração o carrinho abre vazio", () => {
    const saved = writeCart(addToCart(EMPTY_CART, line({ qty: 2 }), NOW));
    expect(readCart(saved, later(6 * DAY + 23 * 60 * 60 * 1000)).lines).toEqual([line({ qty: 2 })]);
    expect(readCart(saved, later(7 * DAY)).lines).toEqual([line({ qty: 2 })]);
    expect(readCart(saved, later(7 * DAY + 60 * 1000))).toEqual(EMPTY_CART);
    // conta da última alteração, não da primeira adição
    const touched = writeCart(addToCart(readCart(saved, later(5 * DAY)), line({ label: "Frasco 1L" }), later(5 * DAY)));
    expect(readCart(touched, later(11 * DAY)).lines).toHaveLength(2);
    expect(readCart(touched, later(12 * DAY + 60 * 1000))).toEqual(EMPTY_CART);
  });

  it("texto inválido, versão desconhecida ou linhas estranhas dão carrinho vazio", () => {
    expect(readCart(null, NOW)).toEqual(EMPTY_CART);
    expect(readCart("{", NOW)).toEqual(EMPTY_CART);
    expect(readCart(JSON.stringify({ version: 2, updatedAt: NOW.toISOString(), lines: [line()] }), NOW)).toEqual(EMPTY_CART);
    expect(readCart(JSON.stringify({ version: 1, updatedAt: NOW.toISOString(), lines: [{ qty: "x" }] }), NOW)).toEqual(EMPTY_CART);
  });

  it("o contador soma as quantidades", () => {
    let cart = addToCart(EMPTY_CART, line({ qty: 3 }), NOW);
    cart = addToCart(cart, line({ productId: "p2", label: "Frasco 1L", qty: 1 }), NOW);
    expect(cartCount(cart)).toBe(4);
    expect(cartCount(EMPTY_CART)).toBe(0);
  });

  it("mudar a quantidade fica entre 1 e 99 e grava a data", () => {
    const cart = addToCart(EMPTY_CART, line({ qty: 3 }), NOW);
    expect(setQty(cart, "p1", "Balde 20L", 7, later(1000)).lines[0].qty).toBe(7);
    expect(setQty(cart, "p1", "Balde 20L", 0, NOW).lines[0].qty).toBe(1);
    expect(setQty(cart, "p1", "Balde 20L", 150, NOW).lines[0].qty).toBe(99);
    expect(setQty(cart, "p1", "Balde 20L", 7, later(1000)).updatedAt).toBe(later(1000).toISOString());
  });

  it("remover tira só a linha daquele produto e embalagem", () => {
    let cart = addToCart(EMPTY_CART, line(), NOW);
    cart = addToCart(cart, line({ label: "Frasco 1L" }), NOW);
    cart = removeLine(cart, "p1", "Balde 20L", NOW);
    expect(cart.lines.map((l) => l.label)).toEqual(["Frasco 1L"]);
  });
});
