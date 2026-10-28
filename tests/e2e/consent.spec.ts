import { expect, test, type Page } from "@playwright/test";
import { seedSite } from "./support/site";

// os testes do aviso começam sem escolha de cookies
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.getByRole("region", { name: "Aviso de cookies" });
const DAY = 24 * 60 * 60 * 1000;

test.beforeEach(async () => {
  await seedSite();
});

test.describe("aviso de cookies", () => {
  test("CONS-01.1: na primeira visita aparece o aviso com Aceitar, Recusar e a política", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Aceitar" })).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Recusar" })).toBeVisible();
    await expect(banner(page).getByRole("link", { name: "Política de privacidade" })).toHaveAttribute("href", "/politica-de-privacidade");
    // em qualquer página pública
    await page.goto("/produtos");
    await expect(banner(page)).toBeVisible();
  });

  test("CONS-01.4: Recusar esconde o aviso por 180 dias", async ({ context, page }) => {
    const start = new Date("2026-11-02T10:00:00Z");
    await context.clock.install({ time: start });
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Recusar" }).click();
    await expect(banner(page)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    await context.clock.setSystemTime(new Date(start.getTime() + 179 * DAY));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    await context.clock.setSystemTime(new Date(start.getTime() + 181 * DAY));
    await page.reload();
    await expect(banner(page)).toBeVisible();
  });

  test("CONS-01.11: Preferências de cookies no rodapé mostra o aviso de novo", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Recusar" }).click();
    await expect(banner(page)).toHaveCount(0);
    await page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" }).click();
    await expect(banner(page)).toBeVisible();
    // também no rodapé curto das outras páginas
    await banner(page).getByRole("button", { name: "Recusar" }).click();
    await page.goto("/produtos");
    await page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" }).click();
    await expect(banner(page)).toBeVisible();
  });
});
