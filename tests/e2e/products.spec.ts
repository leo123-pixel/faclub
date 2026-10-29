import { expect, test } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed();
});

test.describe("lista de produtos", () => {
  test("PLIST-01.2: cada linha mostra capa, nome, embalagem e SKU, categoria, preço, estoque, oferta, visibilidade e Editar", async ({
    page,
  }) => {
    await loginAs(page);
    const row = page.getByRole("row", { name: "Mobil Super 5W-30 Sintético" });
    await expect(row.getByRole("img", { name: "Sem foto" })).toBeVisible();
    await expect(row.getByText("Mobil Super 5W-30 Sintético")).toBeVisible();
    await expect(row.getByText("Frasco 1L · SKU —")).toBeVisible();
    await expect(row.getByRole("cell", { name: "Linha leve" })).toBeVisible();
    await expect(row.getByRole("cell", { name: "R$ 54,90" })).toBeVisible();
    await expect(row.getByRole("cell", { name: "48 un." })).toBeVisible();
    await expect(row.getByRole("switch", { name: "Em oferta: Mobil Super 5W-30 Sintético" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(
      row.getByRole("switch", { name: "Visível no site: Mobil Super 5W-30 Sintético" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(row.getByRole("link", { name: "Editar" })).toHaveAttribute("href", /\/admin\/produtos\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("row", { name: "Texaco Havoline 10W-40" }).getByText("Baixo · 4")).toBeVisible();
    await expect(page.getByText("8 de 8 produtos")).toBeVisible();
    await expect(page.getByText("Página 1 de 1")).toBeVisible();
  });

  test("PLIST-01.9: filtro sem resultado mostra a mensagem e Limpar filtros volta à lista", async ({ page }) => {
    await loginAs(page);
    await page.getByLabel("Buscar produto ou SKU").fill("nada-com-isso");
    await expect(page.getByText("Nenhum produto encontrado.")).toBeVisible();
    await expect(page).toHaveURL(/q=nada-com-isso/);
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page.getByText("8 de 8 produtos")).toBeVisible();
  });

  test("PLIST-01.10: banco sem produtos mostra a mensagem e Novo produto", async ({ page }) => {
    await seed({ products: false });
    await loginAs(page);
    const empty = page.getByRole("status").filter({ hasText: "Nenhum produto cadastrado ainda." });
    await expect(empty).toBeVisible();
    await expect(empty.getByRole("link", { name: "Novo produto" })).toHaveAttribute("href", "/admin/produtos/novo");
  });

  test("PLIST-01.11: Ver no site abre o catálogo em nova aba", async ({ page }) => {
    await loginAs(page);
    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Ver no site" }).click();
    await expect(await popup).toHaveURL(/\/produtos$/);
  });

  test("PLIST-01.13: cada linha tem um interruptor de oferta", async ({ page }) => {
    await loginAs(page);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(8);
    for (const row of await rows.all()) {
      await expect(row.getByRole("switch", { name: /^Em oferta: / })).toHaveCount(1);
    }
  });

  test("PLIST-01.16: a 390 px a lista vira cartões sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page);
    await expect(page.locator("table")).toBeHidden();
    const card = page.getByRole("article", { name: "Lubrax Top Turbo 15W-40" });
    await expect(card).toBeVisible();
    await expect(card.getByText("R$ 389,90")).toBeVisible();
    await expect(card.getByRole("switch", { name: "Em oferta: Lubrax Top Turbo 15W-40" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("PLIST-01.12: os cartões contam ativos, em oferta, estoque baixo e pedidos dos últimos 30 dias", async ({
    page,
  }) => {
    const day = 24 * 60 * 60 * 1000;
    const ago = (d: number) => new Date(Date.now() - d * day).toISOString();
    const { error } = await serviceClient()
      .from("orders")
      .insert([1, 29, 31].map((d) => ({ items: [], total_estimated: 10, created_at: ago(d) })));
    expect(error).toBeNull();
    await loginAs(page);
    const kpis = page.getByRole("region", { name: "Indicadores" });
    await expect(kpis.getByText("Produtos ativos").locator("..")).toContainText("7");
    await expect(kpis.getByText("Em oferta").locator("..")).toContainText("3");
    await expect(kpis.getByText("Estoque baixo").locator("..")).toContainText("2");
    await expect(kpis.getByText("Pedidos · 30 dias").locator("..")).toHaveText("Pedidos · 30 dias2");
  });
});
