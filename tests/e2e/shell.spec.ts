import { expect, test } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";

test.beforeAll(async () => {
  await seed();
});

test.describe("shell do painel", () => {
  test("AUTH-01.7: Sair encerra a sessão e abre o login", async ({ page }) => {
    await loginAs(page);
    await page.goto("/admin/pedidos");
    await page.getByRole("button", { name: "Sair" }).first().click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin/produtos");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("PLIST-01.14: o menu mostra os 8 itens na ordem da spec", async ({ page }) => {
    await loginAs(page);
    await page.goto("/admin/pedidos");
    const items = page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link");
    await expect(items).toHaveText([
      "Visão geral",
      "Produtos",
      "Pedidos",
      "Categorias",
      "Marcas",
      "Banners e ofertas",
      "Cupons",
      "Configurações",
    ]);
  });
});
