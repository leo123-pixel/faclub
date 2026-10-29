import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed();
});

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Categorias" }).click();
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();
}
const names = (page: Page) => page.getByRole("list", { name: "Categorias" }).getByRole("listitem").locator("p.font-semibold");

test.describe("categorias", () => {
  test("TAX-01.1: lista na ordem de position com a contagem de produtos", async ({ page }) => {
    await open(page);
    await expect(names(page)).toHaveText(["Linha leve", "Linha pesada", "Filtros", "Aditivos e graxas"]);
    await expect(page.getByRole("listitem", { name: "Linha leve" })).toContainText("3 produtos");
    await expect(page.getByRole("listitem", { name: "Linha pesada" })).toContainText("4 produtos");
    await expect(page.getByRole("listitem", { name: "Filtros" })).toContainText("1 produto");
    await expect(page.getByRole("listitem", { name: "Aditivos e graxas" })).toContainText("0 produtos");
  });

  test("TAX-01.2: criar Arla 32 grava o slug arla-32 no fim da ordem", async ({ page }) => {
    await open(page);
    await page.getByLabel("Nova categoria").fill("Arla 32");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(names(page)).toHaveText(["Linha leve", "Linha pesada", "Filtros", "Aditivos e graxas", "Arla 32"]);
    const { data } = await serviceClient().from("categories").select("slug, position").eq("name", "Arla 32").single();
    expect(data).toEqual({ slug: "arla-32", position: 5 });
  });

  test("TAX-01.3: excluir categoria com produtos mostra a mensagem com a contagem", async ({ page }) => {
    await open(page);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("listitem", { name: "Linha pesada" }).getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Esta categoria tem 4 produtos. Mude a categoria deles antes de excluir.",
    );
    await expect(page.getByRole("listitem", { name: "Linha pesada" })).toBeVisible();
  });

  test("TAX-01.4: nome repetido mostra Já existe uma com esse nome.", async ({ page }) => {
    await open(page);
    await page.getByLabel("Nova categoria").fill("linha leve");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Já existe uma com esse nome.");
    await expect(names(page)).toHaveCount(4);
  });

  test("TAX-01.9: Subir muda a ordem na tela e grava position", async ({ page }) => {
    await open(page);
    await page.getByRole("listitem", { name: "Filtros" }).getByRole("button", { name: "Subir" }).click();
    await expect(names(page)).toHaveText(["Linha leve", "Filtros", "Linha pesada", "Aditivos e graxas"]);
    await page.reload();
    await expect(names(page)).toHaveText(["Linha leve", "Filtros", "Linha pesada", "Aditivos e graxas"]);
    await page.getByRole("listitem", { name: "Linha leve" }).getByRole("button", { name: "Descer" }).click();
    await expect(names(page)).toHaveText(["Filtros", "Linha leve", "Linha pesada", "Aditivos e graxas"]);
  });

  test("excluir categoria vazia remove da lista", async ({ page }) => {
    await open(page);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("listitem", { name: "Aditivos e graxas" }).getByRole("button", { name: "Excluir" }).click();
    await expect(names(page)).toHaveText(["Linha leve", "Linha pesada", "Filtros"]);
  });
});
