import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { STORAGE_DIR } from "../../scripts/local-supabase/config.mjs";
import { addBanner } from "./support/banners";
import { pngFile } from "./support/images";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";
import { webpSize } from "./support/webp";

test.beforeEach(async () => {
  await seed({ products: false });
});

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Banners e ofertas" }).click();
  await expect(page.getByRole("heading", { name: "Banners e ofertas" })).toBeVisible();
}
const titles = (page: Page) => page.getByRole("list", { name: "Banners" }).getByRole("listitem").locator("p.font-semibold");

test.describe("lista de banners", () => {
  test("BAN-01.1: lista na ordem do campo Ordem com foto, título, Ativo e ordem", async ({ page }) => {
    await addBanner("Troca de óleo", 2);
    await addBanner("Oferta da semana", 1, false);
    await open(page);
    await expect(titles(page)).toHaveText(["Oferta da semana", "Troca de óleo"]);
    const first = page.getByRole("listitem", { name: "Oferta da semana" });
    await expect(first.getByRole("img", { name: "Foto do banner Oferta da semana" })).toBeVisible();
    await expect(first).toContainText("Ordem 1");
    await expect(first.getByRole("switch", { name: "Ativo: Oferta da semana" })).toHaveAttribute("aria-checked", "false");
    await expect(
      page.getByRole("listitem", { name: "Troca de óleo" }).getByRole("switch", { name: "Ativo: Troca de óleo" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("BAN-01.5: desligar Ativo grava sem recarregar a página", async ({ page }) => {
    const id = await addBanner("Oferta da semana", 1);
    await open(page);
    await page.evaluate(() => ((window as unknown as { __marca: boolean }).__marca = true));
    const toggle = page.getByRole("switch", { name: "Ativo: Oferta da semana" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { __marca?: boolean }).__marca)).toBe(true);
    await page.reload();
    await expect(page.getByRole("switch", { name: "Ativo: Oferta da semana" })).toHaveAttribute("aria-checked", "false");
    const { data } = await serviceClient().from("banners").select("is_active").eq("id", id).single();
    expect(data).toEqual({ is_active: false });
  });

  test("BAN-01.6: Excluir pergunta e só exclui com a confirmação", async ({ page }) => {
    await addBanner("Oferta da semana", 1);
    await open(page);
    const asked: string[] = [];
    page.once("dialog", (d) => {
      asked.push(d.message());
      void d.dismiss();
    });
    await page.getByRole("listitem", { name: "Oferta da semana" }).getByRole("button", { name: "Excluir" }).click();
    expect(asked).toEqual(["Excluir este banner?"]);
    await expect(titles(page)).toHaveText(["Oferta da semana"]);

    page.once("dialog", (d) => void d.accept());
    await page.getByRole("listitem", { name: "Oferta da semana" }).getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByText("Nenhum banner cadastrado ainda.")).toBeVisible();
    const { data } = await serviceClient().from("banners").select("id");
    expect(data).toEqual([]);
  });
});

test.describe("cadastro de banner", () => {
  test("BAN-01.2: salvar um banner válido volta à lista com Banner salvo. e a edição grava o novo título", async ({
    page,
  }) => {
    await open(page);
    await page.getByRole("link", { name: "Novo banner" }).click();
    await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "topo.png", 1600, 700));
    await expect(page.getByRole("figure", { name: "Foto 1" })).toBeVisible();
    await expect(page.getByText("Enviando…")).toHaveCount(0);
    await page.getByLabel("Título").fill("Oferta da semana");
    await page.getByLabel("Texto").fill("Lubrax Top Turbo com preço de balde");
    await page.getByLabel("Link").fill("/produtos");
    await page.getByLabel("Ordem").fill("1");
    await page.getByRole("button", { name: "Salvar banner" }).click();
    await expect(page).toHaveURL(/\/admin\/banners\?salvo=1$/);
    await expect(page.getByRole("status")).toHaveText("Banner salvo.");
    await expect(titles(page)).toHaveText(["Oferta da semana"]);

    await page.getByRole("listitem", { name: "Oferta da semana" }).getByRole("link", { name: "Editar" }).click();
    await expect(page.getByLabel("Título")).toHaveValue("Oferta da semana");
    await page.getByLabel("Título").fill("Semana do diesel");
    await page.getByRole("button", { name: "Salvar banner" }).click();
    await expect(page.getByRole("status")).toHaveText("Banner salvo.");
    await expect(titles(page)).toHaveText(["Semana do diesel"]);
    const { data } = await serviceClient().from("banners").select("title, subtitle, link, position, is_active, image_path");
    expect(data).toEqual([
      {
        title: "Semana do diesel",
        subtitle: "Lubrax Top Turbo com preço de balde",
        link: "/produtos",
        position: 1,
        is_active: true,
        image_path: expect.stringMatching(/^banners\/.+\.webp$/),
      },
    ]);
  });

  test("BAN-01.7: a foto chega ao bucket como WebP com o lado maior em 2400 px", async ({ page }) => {
    await open(page);
    await page.getByRole("link", { name: "Novo banner" }).click();
    const started = Date.now();
    await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "grande.png", 3000, 2000));
    await expect(page.getByRole("figure", { name: "Foto 1" })).toBeVisible();
    await expect(page.getByText("Enviando…")).toHaveCount(0);
    const dir = path.join(STORAGE_DIR, "product-images", "banners");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => path.join(dir, f))
      .filter((f) => statSync(f).mtimeMs >= started);
    expect(files).toHaveLength(1);
    expect(JSON.parse(readFileSync(`${files[0]}.meta.json`, "utf8")).contentType).toBe("image/webp");
    expect(webpSize(readFileSync(files[0]))).toEqual({ width: 2400, height: 1600 });
  });

  test("BAN-01.3: salvar sem foto e sem título mostra Campo obrigatório nos dois e não grava", async ({ page }) => {
    await open(page);
    await page.getByRole("link", { name: "Novo banner" }).click();
    await page.getByRole("button", { name: "Salvar banner" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(["Campo obrigatório", "Campo obrigatório"]);
    const { data } = await serviceClient().from("banners").select("id");
    expect(data).toEqual([]);
  });
});
