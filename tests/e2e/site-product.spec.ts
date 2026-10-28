import { expect, test, type Page } from "@playwright/test";
import { seedSite } from "./support/site";

const TOP_TURBO = "/produtos/top-turbo-15w-40";
const main = (page: Page) => page.getByRole("main");

test.beforeEach(async () => {
  await seedSite();
});

test.describe("página do produto", () => {
  test("PDP-01.2: slug inexistente ou produto oculto responde 404 com Produto não encontrado.", async ({ page }) => {
    for (const path of ["/produtos/nao-existe-xyz", "/produtos/helix-ultra-5w-40"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(main(page).getByRole("heading", { level: 1 })).toHaveText("Produto não encontrado.");
      await expect(main(page).getByRole("link", { name: "Ver todos os produtos" })).toHaveAttribute("href", "/produtos");
    }
  });

  test("PDP-01.7: em oferta, Oferta da semana e o preço promocional ao lado do normal riscado", async ({ page }) => {
    await page.goto(TOP_TURBO);
    await expect(main(page).getByText("Oferta da semana")).toBeVisible();
    await expect(main(page).getByText("R$ 349,90", { exact: true })).toBeVisible();
    await expect(main(page).locator("s").first()).toHaveText("de R$ 389,90");
    await page.goto("/produtos/rimula-r4-15w-40");
    await expect(main(page).getByText("Oferta da semana")).toHaveCount(0);
    await expect(main(page).getByText("R$ 459,90", { exact: true })).toBeVisible();
  });

  test("PDP-01.10: com cupom ativo mostra o código e o texto do desconto na loja", async ({ page }) => {
    await page.goto(TOP_TURBO);
    await expect(main(page).getByText("FACLUB10", { exact: true })).toBeVisible();
    await expect(main(page).getByText("10% de desconto na troca feita na loja.")).toBeVisible();
  });

  test("PDP-01.11: trilha Home / Produtos / <marca> <nome> com os dois primeiros como links", async ({ page }) => {
    await page.goto(TOP_TURBO);
    const trail = page.getByRole("navigation", { name: "Trilha" });
    await expect(trail).toHaveText("Home/Produtos/Lubrax Top Turbo 15W-40");
    await expect(trail.getByRole("link")).toHaveText(["Home", "Produtos"]);
    await expect(trail.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(trail.getByRole("link", { name: "Produtos" })).toHaveAttribute("href", "/produtos");
  });

  test("PDP-01.13: abaixo de 768 px a galeria fica acima das informações, numa coluna", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(TOP_TURBO);
    const gallery = (await main(page).getByRole("img", { name: "Lubrax Top Turbo 15W-40" }).boundingBox())!;
    const title = (await main(page).getByRole("heading", { level: 1 }).boundingBox())!;
    expect(gallery.y + gallery.height).toBeLessThanOrEqual(title.y);
    expect(Math.abs(gallery.x - title.x)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("Combine com mostra produtos visíveis de outras categorias", async ({ page }) => {
    await page.goto(TOP_TURBO);
    const related = page.getByRole("list", { name: "Combine com" }).getByRole("listitem");
    await expect(related).toHaveCount(4);
    // destaques de outras categorias primeiro: Super (linha leve) e Filtro de óleo; depois a ordem de cadastro
    await expect(related.getByRole("heading")).toHaveText(["Super 5W-30 Sintético", "Filtro de óleo", "Helix HX8 5W-30", "Havoline 10W-40"]);
  });
});
