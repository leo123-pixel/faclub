import { expect, test, type Page } from "@playwright/test";
import { seedSite } from "./support/site";

const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(window.localStorage.getItem("faclub:carrinho") ?? '{"lines":[]}').lines as { slug: string; label: string; qty: number }[]);
const badge = (page: Page) => page.getByRole("banner").getByTestId("contador-carrinho");

test.beforeEach(async () => {
  await seedSite();
});

test.describe("adicionar ao carrinho", () => {
  test("CART-01.1: na página do produto entram a embalagem e a quantidade escolhidas, com Adicionado ao carrinho e Ver carrinho", async ({ page }) => {
    await page.goto("/produtos/top-turbo-15w-40");
    await page.getByRole("button", { name: "Frasco 1L" }).click();
    for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    const notice = page.getByRole("main").getByRole("status").filter({ hasText: "Adicionado ao carrinho" });
    await expect(notice).toBeVisible();
    await expect(notice.getByRole("link", { name: "Ver carrinho" })).toHaveAttribute("href", "/carrinho");
    expect(await stored(page)).toEqual([expect.objectContaining({ slug: "top-turbo-15w-40", label: "Frasco 1L", qty: 3 })]);
  });

  test("CART-01.2: o + do card adiciona 1 unidade da primeira embalagem", async ({ page }) => {
    await page.goto("/produtos");
    await page.getByRole("button", { name: "Adicionar Mobil Super 5W-30 Sintético ao carrinho" }).click();
    await expect(page.getByRole("main").getByText("Adicionado ao carrinho")).toBeVisible();
    // o Super tem Frasco 1L e Frasco 4L; a primeira do cadastro é o Frasco 1L
    expect(await stored(page)).toEqual([expect.objectContaining({ slug: "super-5w-30-sintetico", label: "Frasco 1L", qty: 1 })]);
  });

  test("CART-01.4: o contador do topo soma as quantidades e some com o carrinho vazio", async ({ page }) => {
    await page.goto("/produtos");
    await expect(badge(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Adicionar Mobil Super 5W-30 Sintético ao carrinho" }).click();
    await expect(badge(page)).toHaveText("1");
    await page.goto("/produtos/top-turbo-15w-40");
    for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await expect(badge(page)).toHaveText("4");
    await expect(page.getByRole("banner").getByRole("link", { name: "Carrinho, 4 itens" })).toBeVisible();
    // esvaziado em outro lugar (outra aba), o contador some
    await page.evaluate(() => {
      window.localStorage.removeItem("faclub:carrinho");
    });
    await page.reload();
    await expect(badge(page)).toHaveCount(0);
  });
});
