import { expect, test } from "@playwright/test";
import { cartLine } from "./support/cart";
import { seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seedSite();
});

test.describe("cotação do carrinho", () => {
  test("devolve o preço do banco, os subtotais e o total; produto oculto fica indisponível", async ({ request }) => {
    const lines = [
      await cartLine("top-turbo-15w-40", "Balde 20L", 2),
      await cartLine("rimula-r4-15w-40", "Balde 20L", 1),
      await cartLine("helix-ultra-5w-40", "Frasco 1L", 1, "Shell Helix Ultra 5W-40"),
    ];
    const res = await request.post("/api/carrinho", { data: { lines } });
    expect(res.status()).toBe(200);
    const quote = await res.json();
    expect(quote.items.map((i: { title: string; label: string; qty: number; price: number; subtotal: number }) => [i.title, i.label, i.qty, i.price, i.subtotal])).toEqual([
      ["Lubrax Top Turbo 15W-40", "Balde 20L", 2, 349.9, 699.8],
      ["Shell Rimula R4 15W-40", "Balde 20L", 1, 459.9, 459.9],
    ]);
    expect(quote.total).toBe(1159.7);
    expect(quote.unavailable).toEqual([lines[2]]);
  });

  test("corpo inválido responde 400", async ({ request }) => {
    expect((await request.post("/api/carrinho", { data: { lines: "x" } })).status()).toBe(400);
    expect((await request.post("/api/carrinho", { data: "nada" })).status()).toBe(400);
    const { count } = await serviceClient().from("orders").select("id", { count: "exact", head: true });
    expect(count).toBe(0);
  });
});

test.describe("envio do pedido", () => {
  const body = async (over: Record<string, unknown> = {}) => ({
    lines: [
      { productId: (await cartLine("top-turbo-15w-40", "Balde 20L", 2)).productId, label: "Balde 20L", qty: 2 },
      { productId: (await cartLine("filtro-de-ar", "Unidade", 1)).productId, label: "Unidade", qty: 1 },
    ],
    name: "João",
    vehicle: "ABC1D23",
    coupon: false,
    sourceUrl: "http://localhost:3100/carrinho",
    ...over,
  });

  test("CART-04.9: mais de 30 itens ou quantidade fora de 1 a 99 responde 400 e nada é gravado", async ({ request }) => {
    const id = (await cartLine("top-turbo-15w-40", "Balde 20L", 1)).productId;
    const many = Array.from({ length: 31 }, () => ({ productId: id, label: "Balde 20L", qty: 1 }));
    for (const lines of [many, [{ productId: id, label: "Balde 20L", qty: 0 }], [{ productId: id, label: "Balde 20L", qty: 100 }]]) {
      const res = await request.post("/api/pedidos", { data: await body({ lines }) });
      expect(res.status()).toBe(400);
    }
    const { count } = await serviceClient().from("orders").select("id", { count: "exact", head: true });
    expect(count).toBe(0);
  });

  test("um envio válido grava o pedido com o preço do banco e devolve o número", async ({ request }) => {
    const res = await request.post("/api/pedidos", { data: await body({ coupon: true }) });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.number).toBeGreaterThan(0);
    expect(json.total).toBe(759.7);
    const { data } = await serviceClient().from("orders").select("*").eq("id", json.number).single();
    expect(data).toMatchObject({
      total_estimated: 759.7,
      customer_name: "João",
      vehicle: "ABC1D23",
      coupon_code: "FACLUB10",
      status: "Novo",
      source_url: "http://localhost:3100/carrinho",
    });
    expect(data!.items.map((i: { title: string; label: string; qty: number; price: number }) => [i.title, i.label, i.qty, i.price])).toEqual([
      ["Lubrax Top Turbo 15W-40", "Balde 20L", 2, 349.9],
      ["Mobil Filtro de ar", "Unidade", 1, 59.9],
    ]);
  });

  test("o 6º envio em 10 minutos responde 429", async ({ request }) => {
    for (let i = 0; i < 5; i++) expect((await request.post("/api/pedidos", { data: await body() })).status()).toBe(200);
    const res = await request.post("/api/pedidos", { data: await body() });
    expect(res.status()).toBe(429);
    expect(await res.json()).toEqual({ error: "Muitos pedidos seguidos. Espere alguns minutos ou fale direto no WhatsApp." });
  });
});

