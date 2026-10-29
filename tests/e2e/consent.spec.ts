import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { seedSite } from "./support/site";

// os testes do aviso começam sem escolha de cookies
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.getByRole("region", { name: "Aviso de cookies" });
const DAY = 24 * 60 * 60 * 1000;

/** Intercepta Google e Meta: nada sai para a internet, e cada pedido fica anotado. */
async function watchTrackers(context: BrowserContext) {
  const hits: string[] = [];
  for (const host of ["https://www.googletagmanager.com/**", "https://connect.facebook.net/**", "https://www.google-analytics.com/**", "https://www.facebook.com/**"]) {
    await context.route(host, (route) => {
      hits.push(route.request().url());
      return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    });
  }
  return hits;
}

async function browse(page: Page) {
  for (const path of ["/", "/produtos", "/produtos/top-turbo-15w-40"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(300);
  }
}

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

  test("CONS-01.2: sem aceite, nenhum pedido vai ao Google nem à Meta", async ({ context, page }) => {
    const hits = await watchTrackers(context);
    // sem escolha
    await browse(page);
    expect(hits).toEqual([]);
    // depois de recusar
    await banner(page).getByRole("button", { name: "Recusar" }).click();
    await browse(page);
    expect(hits).toEqual([]);
    expect(await page.evaluate(() => [typeof window.gtag, typeof window.fbq])).toEqual(["undefined", "undefined"]);
  });

  test("CONS-01.3: Aceitar carrega GA4 e Pixel e esconde o aviso por 180 dias", async ({ context, page }) => {
    const start = new Date("2026-11-02T10:00:00Z");
    await context.clock.install({ time: start });
    const hits = await watchTrackers(context);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Aceitar" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => hits).toEqual(
      expect.arrayContaining(["https://www.googletagmanager.com/gtag/js?id=G-FACLUBTEST", "https://connect.facebook.net/en_US/fbevents.js"]),
    );
    expect(await page.evaluate(() => (window.fbq?.queue ?? []).slice(0, 2))).toEqual([
      ["init", "1234567890"],
      ["track", "PageView"],
    ]);
    // 179 dias depois: sem aviso, scripts carregam direto
    await context.clock.setSystemTime(new Date(start.getTime() + 179 * DAY));
    hits.length = 0;
    await page.goto("/produtos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => hits.length).toBeGreaterThanOrEqual(2);
    // 181 dias depois: o aviso volta e nada carrega antes da escolha
    await context.clock.setSystemTime(new Date(start.getTime() + 181 * DAY));
    hits.length = 0;
    await page.goto("/produtos");
    await expect(banner(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(hits).toEqual([]);
  });
});

