import { expect, test, type Page } from "@playwright/test";
import { pngFile } from "./support/images";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed();
});

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Marcas" }).click();
  await expect(page.getByRole("heading", { name: "Marcas" })).toBeVisible();
}
const names = (page: Page) => page.getByRole("list", { name: "Marcas" }).getByRole("listitem").locator("p.font-semibold");

test.describe("marcas", () => {
  test("TAX-01.5: lista em ordem alfabética com logo e contagem", async ({ page }) => {
    const db = serviceClient();
    await db.storage.from("product-images").upload("brands/lubrax.webp", new Blob(["x"], { type: "image/webp" }), {
      upsert: true,
    });
    await db.from("brands").update({ logo_path: "brands/lubrax.webp" }).eq("slug", "lubrax");
    await open(page);
    await expect(names(page)).toHaveText(["Brutus", "Lubrax", "Mobil", "Shell", "Texaco", "Urania"]);
    await expect(page.getByRole("listitem", { name: "Mobil" })).toContainText("2 produtos");
    await expect(page.getByRole("listitem", { name: "Shell" })).toContainText("2 produtos");
    await expect(page.getByRole("listitem", { name: "Brutus" })).toContainText("1 produto");
    await expect(page.getByRole("img", { name: "Logo Lubrax" })).toHaveAttribute("src", /brands\/lubrax\.webp$/);
  });

  test("TAX-01.6: criar Petronas com logo grava o slug petronas e mostra o logo", async ({ page }) => {
    await open(page);
    await page.getByLabel("Nova marca").fill("Petronas");
    await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "petronas.png", 400, 400));
    await expect(page.getByRole("figure", { name: "Foto 1" })).toBeVisible();
    await expect(page.getByText("Enviando…")).toHaveCount(0);
    await page.getByRole("button", { name: "Adicionar" }).click();
    const logo = page.getByRole("img", { name: "Logo Petronas" });
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const { data } = await serviceClient().from("brands").select("slug, logo_path").eq("name", "Petronas").single();
    expect(data!.slug).toBe("petronas");
    expect(data!.logo_path).toMatch(/^brands\/.+\.webp$/);
  });

  test("TAX-01.7: excluir marca com produtos mostra a mensagem com a contagem", async ({ page }) => {
    await open(page);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("listitem", { name: "Shell" }).getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Esta marca tem 2 produtos. Mude a marca deles antes de excluir.",
    );
    await expect(names(page)).toHaveCount(6);
  });
});
