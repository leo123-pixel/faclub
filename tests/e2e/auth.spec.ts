import { expect, test } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed, USERS } from "./support/seed";

test.beforeAll(async () => {
  await seed();
});

test.describe("acesso ao painel", () => {
  test("AUTH-01.1: sem sessão, as rotas do painel levam ao login", async ({ page }) => {
    for (const path of ["/admin/produtos", "/admin/categorias", "/admin"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("AUTH-01.2: admin com e-mail e senha certos cai em /admin/produtos", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/\/admin\/produtos$/);
  });

  test("AUTH-01.3: senha errada mostra a mensagem e mantém o e-mail", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill(USERS.admin.email);
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
    await expect(page.getByLabel("E-mail")).toHaveValue(USERS.admin.email);
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("AUTH-01.4: usuário sem papel admin é recusado e fica sem sessão", async ({ page }) => {
    await loginAs(page, "user");
    await expect(page.locator("form").getByRole("alert")).toHaveText("Este acesso não tem permissão para o painel.");
    await page.goto("/admin/produtos");
    await expect(page).toHaveURL(/\/admin\/login$/);
    const cookies = await page.context().cookies();
    expect(cookies.filter((c) => c.name.includes("auth-token") && c.value)).toEqual([]);
  });
});
