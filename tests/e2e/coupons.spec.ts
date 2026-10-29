import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed({ products: false });
});

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Cupons" }).click();
  await expect(page.getByRole("heading", { name: "Cupons" })).toBeVisible();
}

test.describe("cupons", () => {
  test("CUP-01.1: a lista mostra código, percentual, texto e Ativo", async ({ page }) => {
    await open(page);
    const row = page.getByRole("listitem", { name: "FACLUB10" });
    await expect(row).toContainText("FACLUB10");
    await expect(row).toContainText("10%");
    await expect(row).toContainText("10% de desconto na troca feita na loja.");
    await expect(row.getByRole("switch", { name: "Ativo: FACLUB10" })).toHaveAttribute("aria-checked", "true");
  });

  test("CUP-01.4: código repetido mostra a mensagem e não grava", async ({ page }) => {
    await open(page);
    const form = page.getByRole("form", { name: "Novo cupom" });
    await form.getByLabel("Código").fill("faclub10");
    await form.getByLabel("Percentual (%)").fill("15");
    await form.getByRole("button", { name: "Salvar cupom" }).click();
    await expect(form.getByRole("alert")).toHaveText("Já existe um cupom com esse código.");
    const { data } = await serviceClient().from("coupons").select("code, percent");
    expect(data).toEqual([{ code: "FACLUB10", percent: 10 }]);
  });

  test("CUP-01.5: desligar Ativo grava sem recarregar a página", async ({ page }) => {
    await open(page);
    await page.evaluate(() => ((window as unknown as { __marca: boolean }).__marca = true));
    const toggle = page.getByRole("switch", { name: "Ativo: FACLUB10" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { __marca?: boolean }).__marca)).toBe(true);
    await page.reload();
    await expect(page.getByRole("switch", { name: "Ativo: FACLUB10" })).toHaveAttribute("aria-checked", "false");
    const { data } = await serviceClient().from("coupons").select("is_active").eq("code", "FACLUB10").single();
    expect(data).toEqual({ is_active: false });
  });

  test("salvar ' troca 15 ' com 15 grava TROCA15", async ({ page }) => {
    await open(page);
    const form = page.getByRole("form", { name: "Novo cupom" });
    await form.getByLabel("Código").fill(" troca 15 ");
    await form.getByLabel("Percentual (%)").fill("15");
    await form.getByLabel("Texto").fill("15% na troca de filtro");
    await form.getByRole("button", { name: "Salvar cupom" }).click();
    await expect(page.getByRole("status")).toHaveText("Cupom salvo.");
    await expect(page.getByRole("listitem", { name: "TROCA15" })).toContainText("15%");
    const { data } = await serviceClient().from("coupons").select("percent, is_active").eq("code", "TROCA15").single();
    expect(data).toEqual({ percent: 15, is_active: true });
  });
});
