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
