import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { STORAGE_DIR } from "../../scripts/local-supabase/config.mjs";
import { addCoverPhoto, pngFile } from "./support/images";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";
import { webpSize } from "./support/webp";

test.beforeEach(async () => {
  await seed();
});

const region = (page: Page, name: string) => page.getByRole("region", { name });

async function openEdit(page: Page, title: string) {
  await page.getByRole("row", { name: title }).getByRole("link", { name: "Editar" }).click();
  await expect(page.getByRole("heading", { name: "Editar produto" })).toBeVisible();
}

async function fillNewProduct(page: Page, name: string) {
  await page.getByRole("link", { name: "Novo produto" }).first().click();
  await expect(page.getByRole("heading", { name: "Cadastrar produto" })).toBeVisible();
  await page.getByLabel("Nome do produto").fill(name);
  await page.getByLabel("Marca").selectOption({ label: "Lubrax" });
  await page.getByLabel("Categoria").selectOption({ label: "Linha pesada" });
  await page.getByRole("button", { name: "Balde 20L" }).click();
  await page.getByRole("group", { name: "Balde 20L" }).getByLabel("Preço (R$)").fill("419,90");
  await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "foto.png", 1200, 900));
  await expect(region(page, "Fotos").getByText("Capa")).toBeVisible();
  await expect(region(page, "Fotos").getByText("Enviando…")).toHaveCount(0);
}

test.describe("cadastro e edição de produto", () => {
  test("PFORM-01.2: Editar abre o formulário com os dados do produto", async ({ page }) => {
    await addCoverPhoto("Top Turbo 15W-40");
    await loginAs(page);
    await openEdit(page, "Lubrax Top Turbo 15W-40");
    await expect(page.getByLabel("Nome do produto")).toHaveValue("Top Turbo 15W-40");
    await expect(page.getByLabel("Marca").locator("option:checked")).toHaveText("Lubrax");
    await expect(page.getByLabel("Categoria").locator("option:checked")).toHaveText("Linha pesada");
    const balde = page.getByRole("group", { name: "Balde 20L" });
    await expect(balde.getByLabel("Preço (R$)")).toHaveValue("389,90");
    await expect(balde.getByLabel("Preço promocional (R$)")).toHaveValue("349,90");
    await expect(page.getByLabel("Estoque", { exact: true })).toHaveValue("12");
    await expect(page.getByLabel("Viscosidade")).toHaveValue("15W-40");
    await expect(region(page, "Fotos").getByRole("figure")).toHaveCount(1);
    await expect(region(page, "Publicação").getByRole("switch", { name: "Em oferta" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("PFORM-01.6: a foto chega ao Storage como WebP com o lado maior em 1600 px", async ({ page }) => {
    await loginAs(page);
    await page.getByRole("link", { name: "Novo produto" }).first().click();
    const started = Date.now();
    await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "grande.png", 3000, 2000));
    await expect(region(page, "Fotos").getByText("Capa")).toBeVisible();
    await expect(region(page, "Fotos").getByText("Enviando…")).toHaveCount(0);

    const dir = path.join(STORAGE_DIR, "product-images", "products");
    const files = readdirSync(dir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => path.join(dir, f))
      .filter((f) => statSync(f).mtimeMs >= started);
    expect(files).toHaveLength(1);
    const meta = JSON.parse(readFileSync(`${files[0]}.meta.json`, "utf8"));
    expect(meta.contentType).toBe("image/webp");
    expect(webpSize(readFileSync(files[0]))).toEqual({ width: 1600, height: 1067 });
  });

  test("PFORM-01.14: salvar um produto válido volta à lista com Produto salvo.", async ({ page }) => {
    await loginAs(page);
    await fillNewProduct(page, "Delvac 15W-40");
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page).toHaveURL(/\/admin\/produtos\?salvo=1$/);
    await expect(page.getByRole("status")).toHaveText("Produto salvo.");
    await expect(page.getByRole("row", { name: "Lubrax Delvac 15W-40" })).toBeVisible();
    const { data } = await serviceClient().from("products").select("slug, is_visible").eq("name", "Delvac 15W-40").single();
    expect(data).toEqual({ slug: "delvac-15w-40", is_visible: true });
  });

  test("PFORM-01.15: Destaque na home ligado e salvo fica gravado", async ({ page }) => {
    await addCoverPhoto("Rimula R4 15W-40");
    await loginAs(page);
    await openEdit(page, "Shell Rimula R4 15W-40");
    const featured = region(page, "Publicação").getByRole("switch", { name: "Destaque na home" });
    await expect(featured).toHaveAttribute("aria-checked", "false");
    await featured.click();
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByRole("status")).toHaveText("Produto salvo.");
    await openEdit(page, "Shell Rimula R4 15W-40");
    await expect(region(page, "Publicação").getByRole("switch", { name: "Destaque na home" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("PFORM-01.19: a 390 px o formulário fica numa coluna com Publicação depois de Informações básicas", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page);
    await page.goto("/admin/produtos/novo");
    const order = ["Informações básicas", "Publicação", "Fotos", "Preço e estoque", "Ficha técnica", "Prévia no site"];
    const boxes = [];
    for (const name of order) boxes.push((await region(page, name).boundingBox())!);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
    for (const b of boxes) expect(Math.round(b.x)).toBe(Math.round(boxes[0].x));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("TAX-01.8: + Nova marca cria a marca sem sair do formulário e já a seleciona", async ({ page }) => {
    await loginAs(page);
    await page.goto("/admin/produtos/novo");
    await page.getByLabel("Nome do produto").fill("Ipiranga F1 Master");
    await page.getByRole("button", { name: "+ Nova marca" }).click();
    await page.getByLabel("Nome da marca").fill("Ipiranga");
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByLabel("Marca").locator("option:checked")).toHaveText("Ipiranga");
    await expect(page.getByLabel("Nome do produto")).toHaveValue("Ipiranga F1 Master");
    await expect(page).toHaveURL(/\/admin\/produtos\/novo$/);
    const { data } = await serviceClient().from("brands").select("slug").eq("name", "Ipiranga").single();
    expect(data).toEqual({ slug: "ipiranga" });
  });
});
