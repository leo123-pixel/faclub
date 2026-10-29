import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { APP_URL } from "../../scripts/local-supabase/config.mjs";
import { seedSite } from "./support/site";

// os testes do aviso começam sem escolha de cookies
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.getByRole("region", { name: "Aviso de cookies" });
const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

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
    await context.clock.setSystemTime(new Date(start.getTime() + 180 * DAY - MINUTE));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    await context.clock.setSystemTime(new Date(start.getTime() + 180 * DAY + MINUTE));
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
    // 1 minuto antes dos 180 dias: sem aviso, scripts carregam direto
    await context.clock.setSystemTime(new Date(start.getTime() + 180 * DAY - MINUTE));
    hits.length = 0;
    await page.goto("/produtos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => hits.length).toBeGreaterThanOrEqual(2);
    // 1 minuto depois dos 180 dias: o aviso volta e nada carrega antes da escolha
    await context.clock.setSystemTime(new Date(start.getTime() + 180 * DAY + MINUTE));
    hits.length = 0;
    await page.goto("/produtos");
    await expect(banner(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(hits).toEqual([]);
  });

  test("CONS-02.1: Recusar depois de aceitar para o GA4 e o Pixel na mesma visita e apaga os cookies deles", async ({ context, page }) => {
    const hits = await watchTrackers(context);
    const cookie = (name: string) => ({ name, value: "1", url: APP_URL });
    await context.addCookies([cookie("_ga"), cookie("_ga_FACLUB"), cookie("_gid"), cookie("_fbp"), cookie("outro")]);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Aceitar" }).click();
    await expect.poll(() => hits.length).toBeGreaterThanOrEqual(2);

    await page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" }).click();
    await Promise.all([page.waitForEvent("load"), banner(page).getByRole("button", { name: "Recusar" }).click()]);
    hits.length = 0;
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    expect(await page.evaluate(() => [typeof window.gtag, typeof window.fbq])).toEqual(["undefined", "undefined"]);
    expect((await context.cookies()).map((c) => c.name).sort()).toEqual(["outro"]);

    // navegação pelo site (sem recarregar) não manda nada
    await page.getByRole("banner").getByRole("link", { name: "Produtos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
    await page.getByRole("link", { name: /Top Turbo/ }).first().click();
    await expect(page).toHaveURL(/top-turbo-15w-40/);
    await page.waitForTimeout(500);
    expect(hits).toEqual([]);
  });
});
