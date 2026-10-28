import { expect, test } from "@playwright/test";

test.describe("acesso ao painel", () => {
  test("AUTH-01.1: sem sessão, as rotas do painel levam ao login", async ({ page }) => {
    for (const path of ["/admin/produtos", "/admin/categorias", "/admin"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });
});
