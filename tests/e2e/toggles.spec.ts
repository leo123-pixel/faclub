import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";

test.beforeEach(async () => {
  await seed();
});

const sw = (page: Page, label: string) => page.locator("table").getByRole("switch", { name: label });

/** Marca a página; se ela recarregar, a marca some. */
async function markNoReload(page: Page) {
  await page.evaluate(() => ((window as unknown as { __marca: boolean }).__marca = true));
}
const stillSamePage = (page: Page) => page.evaluate(() => (window as unknown as { __marca?: boolean }).__marca === true);

test.describe("interruptores da lista", () => {
  test("PTOG-01.1: desligar Visível no site persiste sem recarregar e o produto vai para Ocultos", async ({ page }) => {
    await loginAs(page);
    await markNoReload(page);
    const visible = sw(page, "Visível no site: Shell Helix HX8 5W-30");
    await visible.click();
    await expect(visible).toHaveAttribute("aria-checked", "false");
    await expect(visible).toBeEnabled();
    expect(await stillSamePage(page)).toBe(true);

    await page.reload();
    await expect(sw(page, "Visível no site: Shell Helix HX8 5W-30")).toHaveAttribute("aria-checked", "false");
    await page.getByRole("tab", { name: "Ocultos" }).click();
    await expect(page.getByRole("row", { name: "Shell Helix HX8 5W-30" })).toBeVisible();
  });

  test("PTOG-01.2: ligar a oferta de um produto com preço promocional persiste", async ({ page }) => {
    await loginAs(page);
    const promo = sw(page, "Em oferta: Mobil Super 5W-30 Sintético");
    await promo.click();
    await expect(promo).toHaveAttribute("aria-checked", "false");
    await expect(promo).toBeEnabled();
    await page.reload();
    await expect(promo).toHaveAttribute("aria-checked", "false");

    await markNoReload(page);
    await promo.click();
    await expect(promo).toHaveAttribute("aria-checked", "true");
    await expect(promo).toBeEnabled();
    expect(await stillSamePage(page)).toBe(true);
    await page.reload();
    await expect(promo).toHaveAttribute("aria-checked", "true");
  });

  test("PTOG-01.3: oferta sem preço promocional volta e mostra a mensagem", async ({ page }) => {
    await loginAs(page);
    const promo = sw(page, "Em oferta: Shell Rimula R4 15W-40");
    await promo.click();
    const row = page.getByRole("row", { name: "Shell Rimula R4 15W-40" });
    await expect(row.getByRole("alert")).toHaveText("Informe o preço promocional antes de ativar a oferta.");
    await expect(promo).toHaveAttribute("aria-checked", "false");
    await page.reload();
    await expect(sw(page, "Em oferta: Shell Rimula R4 15W-40")).toHaveAttribute("aria-checked", "false");
  });
});
