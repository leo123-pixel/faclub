import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { cartLine } from "./support/cart";
import { seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

test.beforeEach(async ({ context }) => {
  await seedSite();
  // o WhatsApp não abre no teste: a aba recebe uma página vazia no endereço wa.me
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>WhatsApp</p>" }));
});

async function fillCart(page: Page, lines: Awaited<ReturnType<typeof cartLine>>[]) {
  await page.goto("/politica-de-privacidade");
  await page.evaluate(
    (l) => window.localStorage.setItem("faclub:carrinho", JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), lines: l })),
    lines,
  );
  await page.goto("/carrinho");
  await expect(page.getByTestId("total-estimado")).not.toHaveText("R$ 0,00");
}

const twoItems = async () => [
  await cartLine("top-turbo-15w-40", "Balde 20L", 2, "Lubrax Top Turbo 15W-40"),
  await cartLine("filtro-de-ar", "Unidade", 1, "Mobil Filtro de ar"),
];

/** Clica em enviar e devolve o texto que chegou ao WhatsApp. */
async function sendAndRead(context: BrowserContext, page: Page) {
  const popup = context.waitForEvent("page");
  await page.getByRole("button", { name: "Enviar pedido pelo WhatsApp" }).click();
  const tab = await popup;
  await tab.waitForURL(/^https:\/\/wa\.me\//);
  const url = new URL(tab.url());
  return { url: tab.url(), path: url.pathname, text: url.searchParams.get("text") ?? "" };
}

const orders = async () => (await serviceClient().from("orders").select("*").order("id")).data ?? [];

test.describe("enviar o pedido", () => {
  test("CART-04.4: o servidor grava itens, total, nome, veículo, status Novo e a página de origem", async ({ context, page }) => {
    await fillCart(page, await twoItems());
    await page.getByLabel("Nome (opcional)").fill("João");
    await page.getByLabel("Veículo (opcional)").fill("ABC1D23");
    const sent = await sendAndRead(context, page);
    const [order] = await orders();
    expect(order).toMatchObject({
      total_estimated: 759.7,
      customer_name: "João",
      vehicle: "ABC1D23",
      status: "Novo",
      source_url: "http://localhost:3100/carrinho",
      coupon_code: null,
    });
    expect(order.items).toEqual([
      expect.objectContaining({ title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2, price: 349.9, subtotal: 699.8 }),
      expect.objectContaining({ title: "Mobil Filtro de ar", label: "Unidade", qty: 1, price: 59.9, subtotal: 59.9 }),
    ]);
    expect(sent.path).toBe("/551129545764");
    expect(sent.text).toBe(
      [
        `Olá! Quero fazer este pedido pelo site (Pedido nº ${order.id}):`,
        "",
        "- Lubrax Top Turbo 15W-40 · Balde 20L · 2 x R$ 349,90 = R$ 699,80",
        "- Mobil Filtro de ar · Unidade · 1 x R$ 59,90 = R$ 59,90",
        "",
        "Total estimado: R$ 759,70",
        "Nome: João",
        "Veículo: ABC1D23",
      ].join("\n"),
    );
  });

  test("CART-04.10: depois do envio o carrinho fica vazio e aparece Pedido enviado!", async ({ context, page }) => {
    await fillCart(page, await twoItems());
    const sent = await sendAndRead(context, page);
    await expect(page.getByText("Pedido enviado! Termine a conversa no WhatsApp.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir o WhatsApp de novo" })).toHaveAttribute("href", sent.url);
    await expect(page.getByRole("banner").getByTestId("contador-carrinho")).toHaveCount(0);
    expect(await page.evaluate(() => window.localStorage.getItem("faclub:carrinho"))).toBeNull();
    await page.reload();
    await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
  });

  test("CART-04.11: o pedido guarda só nome e veículo, sem telefone, e-mail ou IP", async ({ context, page }) => {
    await fillCart(page, await twoItems());
    await page.getByLabel("Nome (opcional)").fill("Maria");
    await sendAndRead(context, page);
    const [order] = await orders();
    expect(Object.keys(order).sort()).toEqual(
      ["coupon_code", "created_at", "customer_name", "id", "items", "source_url", "status", "total_estimated", "vehicle"].sort(),
    );
    expect(JSON.stringify(order)).not.toMatch(/127\.0\.0\.1|::1|localhost:3100\/api|@|telefone|phone|email/i);
    for (const item of order.items) expect(Object.keys(item).sort()).toEqual(["label", "price", "productId", "qty", "subtotal", "title"]);
  });

  test("CART-04.14: com a caixa do cupom marcada a mensagem leva o cupom e o pedido grava o código", async ({ context, page }) => {
    await fillCart(page, await twoItems());
    await page.getByRole("checkbox", { name: "Quero fazer a troca na loja com o cupom FACLUB10" }).check();
    const sent = await sendAndRead(context, page);
    expect(sent.text.split("\n").at(-1)).toBe("Cupom: FACLUB10 (troca na loja)");
    const [order] = await orders();
    expect(order.coupon_code).toBe("FACLUB10");
  });

  test("CART-04.8: nome acima de 80 caracteres não envia e mostra a mensagem", async ({ page }) => {
    await fillCart(page, await twoItems());
    await page.getByLabel("Nome (opcional)").fill("a".repeat(81));
    await page.getByRole("button", { name: "Enviar pedido pelo WhatsApp" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Use até 80 caracteres no nome e 40 no veículo.");
    await page.getByLabel("Nome (opcional)").fill("João");
    await page.getByLabel("Veículo (opcional)").fill("v".repeat(41));
    await page.getByRole("button", { name: "Enviar pedido pelo WhatsApp" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Use até 80 caracteres no nome e 40 no veículo.");
    expect(await orders()).toEqual([]);
    expect(page.context().pages()).toHaveLength(1);
  });

  test("dois cliques seguidos gravam um pedido só", async ({ context, page }) => {
    await fillCart(page, await twoItems());
    // o servidor demora um pouco, como numa conexão lenta
    await page.route("**/api/pedidos", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });
    const button = page.getByRole("button", { name: "Enviar pedido pelo WhatsApp" });
    await button.dblclick();
    await expect(page.getByText("Pedido enviado! Termine a conversa no WhatsApp.")).toBeVisible();
    expect(await orders()).toHaveLength(1);
    expect(context.pages().filter((p) => p.url().startsWith("https://wa.me/"))).toHaveLength(1);
  });
});
