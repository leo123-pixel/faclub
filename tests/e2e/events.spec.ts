import { expect, test, type Page } from "@playwright/test";
import { cartLine, productId } from "./support/cart";
import { seedSite } from "./support/site";
import { cookiesAccepted, sentEvents, stubTrackers } from "./support/trackers";

test.use({ storageState: cookiesAccepted() });

test.beforeEach(async ({ context }) => {
  await seedSite();
  await stubTrackers(context);
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>WhatsApp</p>" }));
});

/** O mesmo evento chegou ao GA4 e ao Pixel com estes parâmetros. */
async function expectSent(page: Page, name: string, params: Record<string, unknown>) {
  await expect
    .poll(async () => {
      const sent = await sentEvents(page);
      return [sent.ga4.filter(([n]) => n === name).at(-1)?.[1], sent.pixel.filter(([n]) => n === name).at(-1)?.[1]];
    })
    .toEqual([params, params]);
}

test.describe("eventos de produto, carrinho e pedido", () => {
  test("CONS-01.5: a página do produto envia view_item com id, nome, marca e preço", async ({ page }) => {
    await page.goto("/produtos/top-turbo-15w-40");
    await expectSent(page, "view_item", {
      item_id: await productId("top-turbo-15w-40"),
      item_name: "Lubrax Top Turbo 15W-40",
      item_brand: "Lubrax",
      price: 349.9,
      currency: "BRL",
    });
  });

  test("CONS-01.6: adicionar ao carrinho envia add_to_cart com id, embalagem, quantidade e preço", async ({ page }) => {
    await page.goto("/produtos/top-turbo-15w-40");
    await page.getByRole("button", { name: "Frasco 1L" }).click();
    await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await expectSent(page, "add_to_cart", {
      item_id: await productId("top-turbo-15w-40"),
      item_name: "Lubrax Top Turbo 15W-40",
      item_variant: "Frasco 1L",
      quantity: 2,
      price: 39.9,
      currency: "BRL",
    });
    // o "+" do card também
    await page.goto("/produtos");
    await page.getByRole("button", { name: "Adicionar Mobil Filtro de ar ao carrinho" }).click();
    await expectSent(page, "add_to_cart", {
      item_id: await productId("filtro-de-ar"),
      item_name: "Mobil Filtro de ar",
      item_variant: "Unidade",
      quantity: 1,
      price: 59.9,
      currency: "BRL",
    });
  });

  test("CONS-01.7: enviar o pedido envia send_order_whatsapp com o número de itens e o total", async ({ context, page }) => {
    await page.goto("/politica-de-privacidade");
    const lines = [
      await cartLine("top-turbo-15w-40", "Balde 20L", 2, "Lubrax Top Turbo 15W-40"),
      await cartLine("filtro-de-ar", "Unidade", 1, "Mobil Filtro de ar"),
    ];
    await page.evaluate(
      (l) => window.localStorage.setItem("faclub:carrinho", JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), lines: l })),
      lines,
    );
    await page.goto("/carrinho");
    await expect(page.getByTestId("total-estimado")).toHaveText("R$ 759,70");
    const popup = context.waitForEvent("page");
    await page.getByRole("button", { name: "Enviar pedido pelo WhatsApp" }).click();
    await (await popup).waitForURL(/wa\.me/);
    await expectSent(page, "send_order_whatsapp", { items: 3, value: 759.7, currency: "BRL" });
  });
});

test.describe("eventos de WhatsApp, cupom e grupo", () => {
  test("CONS-01.8: cada botão de WhatsApp fora do pedido envia click_whatsapp com o seu local", async ({ page }) => {
    const main = () => page.getByRole("main");
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Agendar troca" }).click();
    await expectSent(page, "click_whatsapp", { location: "topo" });
    await main().getByRole("link", { name: "Agendar pelo WhatsApp" }).click();
    await expectSent(page, "click_whatsapp", { location: "banner" });
    await main().getByRole("link", { name: "Pedir orçamento" }).click();
    await expectSent(page, "click_whatsapp", { location: "servicos" });
    await page.getByRole("region", { name: "Passa aqui na FAC LUB" }).getByRole("link", { name: "Chamar no WhatsApp" }).click();
    await expectSent(page, "click_whatsapp", { location: "contato" });
    await page.goto("/produtos");
    await page.getByRole("searchbox", { name: "Buscar produtos" }).fill("xyz");
    await main().getByRole("link", { name: "Chamar no WhatsApp" }).click();
    await expectSent(page, "click_whatsapp", { location: "catalogo_vazio" });
    // cada clique gerou exatamente um evento no GA4 e um no Pixel
    const sent = await sentEvents(page);
    expect(sent.ga4.filter(([n]) => n === "click_whatsapp").map(([, p]) => p.location)).toEqual(["catalogo_vazio"]);
    expect(sent.pixel.filter(([n]) => n === "click_whatsapp").map(([, p]) => p.location)).toEqual(["catalogo_vazio"]);
  });

  test("CONS-01.9: copiar o cupom envia copy_coupon", async ({ context, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("button", { name: "Copiar" }).click();
    await expect(page.getByRole("button", { name: "Copiado" })).toBeVisible();
    await expectSent(page, "copy_coupon", { coupon: "FACLUB10" });
  });

  test("CONS-01.10: Entrar no grupo de ofertas envia join_group", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Entrar no grupo de ofertas" }).click();
    await expectSent(page, "join_group", {});
  });
});

test.describe("sem aceite", () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3100",
          localStorage: [{ name: "faclub:cookies", value: JSON.stringify({ version: 1, choice: "recusado", at: new Date().toISOString() }) }],
        },
      ],
    },
  });

  test("com os cookies recusados, produto, carrinho e pedido não chegam às filas", async ({ page }) => {
    await page.goto("/produtos/top-turbo-15w-40");
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => [typeof window.dataLayer, typeof window.fbq])).toEqual(["undefined", "undefined"]);
  });
});
