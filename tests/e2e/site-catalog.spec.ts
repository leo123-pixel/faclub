import { expect, test, type Page } from "@playwright/test";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

const grid = (page: Page) => page.getByRole("list", { name: "Produtos" });
const names = (page: Page) => grid(page).getByRole("listitem").getByRole("heading");
const count = (page: Page) => page.getByText(/^\d+ produtos?$/);

test.beforeEach(async () => {
  await seedSite();
});

/** Cria produtos visíveis a mais, direto no banco. */
async function addVisibleProducts(n: number) {
  const db = serviceClient();
  const { data: brand } = await db.from("brands").select("id").eq("slug", "mobil").single();
  const { data: category } = await db.from("categories").select("id").eq("slug", "linha-leve").single();
  for (let i = 1; i <= n; i++) {
    const { data: p, error } = await db
      .from("products")
      .insert({ slug: `extra-${i}`, name: `Extra ${i}`, brand_id: brand!.id, category_id: category!.id, is_visible: true, stock: 1 })
      .select("id")
      .single();
    if (error) throw error;
    await db.from("product_variants").insert({ product_id: p!.id, label: "Frasco 1L", price: 10 + i, position: 0 });
  }
}

test.describe("catálogo", () => {
  test("CAT-01.2: lista só produtos visíveis", async ({ page }) => {
    await page.goto("/produtos");
    await expect(grid(page).getByRole("listitem")).toHaveCount(12);
    await expect(count(page)).toHaveText("12 produtos");
    await expect(page.getByRole("heading", { name: "Helix Ultra 5W-40" })).toHaveCount(0);
    await page.getByRole("searchbox", { name: "Buscar produtos" }).fill("helix ultra");
    await expect(page.getByText("Nenhum produto encontrado.", { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Helix Ultra 5W-40" })).toHaveCount(0);
  });

  test("CAT-01.3: escolher a categoria filtra sem recarregar e põe ?categoria= na URL", async ({ page }) => {
    await page.goto("/produtos");
    await page.evaluate(() => ((window as unknown as { semRecarregar: boolean }).semRecarregar = true));
    const chips = page.getByRole("group", { name: "Categorias" });
    await chips.getByRole("button", { name: "Linha pesada" }).click();
    await expect(page).toHaveURL(/\/produtos\?categoria=linha-pesada$/);
    await expect(names(page)).toHaveText([
      "Top Turbo 15W-40",
      "Rimula R4 15W-40",
      "Brutus 15W-40",
      "Delvac 15W-40",
      "Urania 15W-40",
    ]);
    await expect(chips.getByRole("button", { name: "Linha pesada" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => (window as unknown as { semRecarregar?: boolean }).semRecarregar)).toBe(true);
    await chips.getByRole("button", { name: "Todos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
    await expect(grid(page).getByRole("listitem")).toHaveCount(12);
  });

  test("CAT-01.4: /produtos?categoria=<slug> abre já filtrado", async ({ page }) => {
    await page.goto("/produtos?categoria=filtros");
    await expect(names(page)).toHaveText(["Filtro de óleo", "Filtro de ar"]);
    await expect(page.getByRole("group", { name: "Categorias" }).getByRole("button", { name: "Filtros" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(count(page)).toHaveText("2 produtos");
    // a busca e a ordem também vêm da URL
    await page.goto("/produtos?categoria=linha-pesada&q=15w40&ordem=menor-preco");
    await expect(page.getByRole("searchbox", { name: "Buscar produtos" })).toHaveValue("15w40");
    await expect(page.getByRole("combobox", { name: "Ordenar" })).toHaveValue("menor-preco");
    await expect(names(page)).toHaveText([
      "Brutus 15W-40",
      "Top Turbo 15W-40",
      "Urania 15W-40",
      "Delvac 15W-40",
      "Rimula R4 15W-40",
    ]);
  });

  test("CAT-01.11: Carregar mais aparece só com mais produtos e acrescenta os próximos 12", async ({ page }) => {
    await page.goto("/produtos");
    await expect(grid(page).getByRole("listitem")).toHaveCount(12);
    await expect(page.getByRole("button", { name: "Carregar mais" })).toHaveCount(0);
    // 27 visíveis: 12, depois 24, depois os 27 e o botão some
    await addVisibleProducts(15);
    await refreshSite();
    await page.goto("/produtos");
    await expect(count(page)).toHaveText("27 produtos");
    await expect(grid(page).getByRole("listitem")).toHaveCount(12);
    await page.getByRole("button", { name: "Carregar mais" }).click();
    await expect(grid(page).getByRole("listitem")).toHaveCount(24);
    await expect(page.getByRole("button", { name: "Carregar mais" })).toBeVisible();
    await page.getByRole("button", { name: "Carregar mais" }).click();
    await expect(grid(page).getByRole("listitem")).toHaveCount(27);
    await expect(page.getByRole("button", { name: "Carregar mais" })).toHaveCount(0);
  });

  test("CAT-01.12: sem resultado mostra a mensagem e Chamar no WhatsApp, também com 0 produtos visíveis", async ({ page }) => {
    const message = "Nenhum produto encontrado. Tente outra busca ou fale com a gente no WhatsApp.";
    const whatsapp = "https://wa.me/551129545764?text=" + encodeURIComponent("Olá! Vim pelo site da FAC LUB.");
    await page.goto("/produtos");
    await page.getByRole("searchbox", { name: "Buscar produtos" }).fill("xyz");
    await expect(page.getByText(message)).toBeVisible();
    await expect(count(page)).toHaveText("0 produtos");
    await expect(page.getByRole("main").getByRole("link", { name: "Chamar no WhatsApp" })).toHaveAttribute("href", whatsapp);

    await serviceClient().from("products").update({ is_visible: false }).neq("name", "");
    await refreshSite();
    await page.goto("/produtos");
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Chamar no WhatsApp" })).toHaveAttribute("href", whatsapp);
  });
});
