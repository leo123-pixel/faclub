import { describe, expect, it } from "vitest";
import type { CartLine } from "./cart";
import { applyQuote, ORDER_MESSAGES, orderMessage, orderWhatsappLink, priceCart, unavailableNotice, validateOrderInput, type PriceRow } from "./order";

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

const items = [
  { title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2, price: 349.9, subtotal: 699.8 },
  { title: "Shell Rimula R4 15W-40", label: "Balde 20L", qty: 1, price: 1234.5, subtotal: 1234.5 },
];

describe("cotação reaplicada no carrinho", () => {
  it("mudar a quantidade recalcula subtotal e total com o preço da última cotação", () => {
    const quote = priceCart([line("top", "Balde 20L", 1), line("sumiu", "Balde 20L", 1)], [topTurbo]);
    const now = applyQuote([line("top", "Balde 20L", 3), line("sumiu", "Balde 20L", 1), line("rimula", "Balde 20L", 1)], quote);
    expect(now.items.map((i) => [i.qty, i.price, i.subtotal])).toEqual([[3, 349.9, 1049.7]]);
    expect(now.total).toBe(1049.7);
    expect(now.unavailable.map((l) => l.productId)).toEqual(["sumiu"]);
    expect(now.pending.map((l) => l.productId)).toEqual(["rimula"]);
    // removido do carrinho, sai da conta
    expect(applyQuote([], quote)).toEqual({ items: [], unavailable: [], pending: [], total: 0 });
  });
});

describe("mensagem do pedido", () => {
  it("CART-04.2: a mensagem segue o modelo, uma linha por item, e vai no link do WhatsApp da loja", () => {
    const text = orderMessage({ number: 1042, items, total: 1934.3, name: "João", vehicle: "ABC1D23", coupon: "FACLUB10" });
    expect(text).toBe(
      [
        "Olá! Quero fazer este pedido pelo site (Pedido nº 1042):",
        "",
        "- Lubrax Top Turbo 15W-40 · Balde 20L · 2 x R$ 349,90 = R$ 699,80",
        "- Shell Rimula R4 15W-40 · Balde 20L · 1 x R$ 1.234,50 = R$ 1.234,50",
        "",
        "Total estimado: R$ 1.934,30",
        "Nome: João",
        "Veículo: ABC1D23",
        "Cupom: FACLUB10 (troca na loja)",
      ].join("\n"),
    );
    expect(orderWhatsappLink("1129545764", text)).toBe(`https://wa.me/551129545764?text=${encodeURIComponent(text)}`);
  });

  it("CART-04.3: sem nome, veículo ou cupom a linha some; sem número some o trecho do pedido", () => {
    const text = orderMessage({ number: null, items: items.slice(0, 1), total: 699.8, name: "  ", vehicle: "", coupon: null });
    expect(text).toBe(
      [
        "Olá! Quero fazer este pedido pelo site:",
        "",
        "- Lubrax Top Turbo 15W-40 · Balde 20L · 2 x R$ 349,90 = R$ 699,80",
        "",
        "Total estimado: R$ 699,80",
      ].join("\n"),
    );
    const onlyVehicle = orderMessage({ number: 7, items: items.slice(0, 1), total: 699.8, name: "", vehicle: " Fiorino ", coupon: null });
    expect(onlyVehicle.split("\n").slice(-2)).toEqual(["Total estimado: R$ 699,80", "Veículo: Fiorino"]);
  });
});

describe("plano B sem cotação", () => {
  it("CART-05.1: item sem preço sai com preço a confirmar e o total com a confirmar", () => {
    const text = orderMessage({
      number: null,
      items: [
        { title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2, price: 349.9, subtotal: 699.8 },
        { title: "Mobil Filtro de ar", label: "Unidade", qty: 1, price: null, subtotal: null },
      ],
      total: null,
      name: "",
      vehicle: "",
      coupon: null,
    });
    expect(text).toBe(
      [
        "Olá! Quero fazer este pedido pelo site:",
        "",
        "- Lubrax Top Turbo 15W-40 · Balde 20L · 2 x R$ 349,90 = R$ 699,80",
        "- Mobil Filtro de ar · Unidade · 1 x preço a confirmar",
        "",
        "Total estimado: a confirmar",
      ].join("\n"),
    );
  });
});

describe("validação do pedido", () => {
  const valid = { lines: [{ productId: "p1", label: "Balde 20L", qty: 2 }], name: "", vehicle: "", coupon: false, sourceUrl: "/carrinho" };

  it("nome até 80 e veículo até 40 passam; 81 e 41 recusam com a mensagem da spec", () => {
    expect(validateOrderInput({ ...valid, name: "a".repeat(80), vehicle: "b".repeat(40) }).ok).toBe(true);
    for (const body of [{ ...valid, name: "a".repeat(81) }, { ...valid, vehicle: "b".repeat(41) }]) {
      expect(validateOrderInput(body)).toEqual({ ok: false, message: "Use até 80 caracteres no nome e 40 no veículo." });
    }
    expect(ORDER_MESSAGES.length).toBe("Use até 80 caracteres no nome e 40 no veículo.");
  });

  it("conta caracteres como o banco: acentos decompostos e emojis valem 1", () => {
    const decomposed = "e\u0301".repeat(80); // 80 "é" escritos com acento separado
    const ok = validateOrderInput({ ...valid, name: decomposed, vehicle: "🚗".repeat(40) });
    expect(ok.ok).toBe(true);
    expect(ok.ok && Array.from(ok.value.name)).toHaveLength(80);
    expect(validateOrderInput({ ...valid, vehicle: "🚗".repeat(41) })).toEqual({ ok: false, message: ORDER_MESSAGES.length });
  });

  it("linhas repetidas do mesmo produto e embalagem somam e não passam de 99", () => {
    const merged = validateOrderInput({
      ...valid,
      lines: [
        { productId: "p1", label: "Balde 20L", qty: 40 },
        { productId: "p1", label: "Frasco 1L", qty: 1 },
        { productId: "p1", label: "Balde 20L", qty: 59 },
      ],
    });
    expect(merged.ok && merged.value.lines).toEqual([
      { productId: "p1", label: "Balde 20L", qty: 99 },
      { productId: "p1", label: "Frasco 1L", qty: 1 },
    ]);
    const over = validateOrderInput({ ...valid, lines: Array.from({ length: 30 }, () => ({ productId: "p1", label: "Balde 20L", qty: 99 })) });
    expect(over).toEqual({ ok: false, message: ORDER_MESSAGES.invalid });
  });

  it("até 30 linhas e quantidade inteira de 1 a 99; o resto recusa", () => {
    const lines = (n: number, qty = 1) => Array.from({ length: n }, (_, i) => ({ productId: `p${i}`, label: "Frasco 1L", qty }));
    expect(validateOrderInput({ ...valid, lines: lines(30) }).ok).toBe(true);
    expect(validateOrderInput({ ...valid, lines: lines(1, 99) }).ok).toBe(true);
    for (const bad of [lines(31), lines(0), lines(1, 0), lines(1, 100), lines(1, 1.5)]) {
      expect(validateOrderInput({ ...valid, lines: bad })).toEqual({ ok: false, message: ORDER_MESSAGES.invalid });
    }
    expect(validateOrderInput(null).ok).toBe(false);
    const ok = validateOrderInput({ ...valid, name: "  João  " });
    expect(ok.ok && ok.value.name).toBe("João");
  });
});
