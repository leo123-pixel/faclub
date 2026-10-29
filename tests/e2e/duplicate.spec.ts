import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

let delvacId = "";

test.beforeEach(async () => {
  await seed();
  const db = serviceClient();
  const ids = await db.from("brands").select("id").eq("slug", "mobil").single();
  const cat = await db.from("categories").select("id").eq("slug", "linha-pesada").single();
  delvacId = randomUUID();
  const { error } = await db.rpc("save_product", {
    p: {
      id: delvacId,
      name: "Delvac 15W-40",
      brand_id: ids.data!.id,
      category_id: cat.data!.id,
      stock: 20,
      is_visible: true,
      specs: { viscosity: "15W-40", type: "Mineral" },
      variants: [
        { label: "Frasco 1L", price: 49.9 },
        { label: "Balde 20L", price: 419.9, promo_price: 399.9 },
      ],
      images: [{ path: `products/${delvacId}/a.webp`, is_cover: true }],
    },
  });
  expect(error).toBeNull();
});

test.describe("duplicar produto", () => {
  test("PDUP-01.1: Duplicar abre o formulário copiado, com (cópia) e oculto", async ({ page }) => {
    await loginAs(page);
    await page.goto(`/admin/produtos/${delvacId}`);
    await page.getByRole("link", { name: "Duplicar" }).click();
    await expect(page.getByRole("heading", { name: "Cadastrar produto" })).toBeVisible();
    await expect(page.getByLabel("Nome do produto")).toHaveValue("Delvac 15W-40 (cópia)");
    await expect(page.getByLabel("Marca").locator("option:checked")).toHaveText("Mobil");
    await expect(page.getByRole("group", { name: "Frasco 1L" }).getByLabel("Preço (R$)")).toHaveValue("49,90");
    await expect(page.getByRole("group", { name: "Balde 20L" }).getByLabel("Preço promocional (R$)")).toHaveValue(
      "399,90",
    );
    await expect(page.getByRole("region", { name: "Fotos" }).getByRole("figure")).toHaveCount(1);
    await expect(
      page.getByRole("region", { name: "Publicação" }).getByRole("switch", { name: "Visível no site" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  test("PDUP-01.2: salvar a cópia cria outro produto e não muda o original", async ({ page }) => {
    await loginAs(page);
    await page.goto(`/admin/produtos/novo?de=${delvacId}`);
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByRole("status")).toHaveText("Produto salvo.");

    const { data } = await serviceClient()
      .from("products")
      .select("id, name, slug, is_visible, variants:product_variants(label)")
      .like("name", "Delvac%")
      .order("created_at");
    expect(data!.map((p) => [p.name, p.slug, p.is_visible])).toEqual([
      ["Delvac 15W-40", "delvac-15w-40", true],
      ["Delvac 15W-40 (cópia)", "delvac-15w-40-copia", false],
    ]);
    expect(data![0].id).toBe(delvacId);
    expect(data![1].variants).toHaveLength(2);
  });
});
