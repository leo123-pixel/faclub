import { expect, test, type Page } from "@playwright/test";
import { addBanner } from "./support/banners";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

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
