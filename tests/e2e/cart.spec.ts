import { expect, test, type Page } from "@playwright/test";
import { cartLine } from "./support/cart";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(window.localStorage.getItem("faclub:carrinho") ?? '{"lines":[]}').lines as { slug: string; label: string; qty: number }[]);
const badge = (page: Page) => page.getByRole("banner").getByTestId("contador-carrinho");

test.beforeEach(async () => {
  await seedSite();
});

test.describe("adicionar ao carrinho", () => {
  test("CART-01.1: na página do produto entram a embalagem e a quantidade escolhidas, com Adicionado ao carrinho e Ver carrinho", async ({ page }) => {
    await page.goto("/produtos/top-turbo-15w-40");
    await page.getByRole("button", { name: "Frasco 1L" }).click();
    for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    const notice = page.getByRole("main").getByRole("status").filter({ hasText: "Adicionado ao carrinho" });
    await expect(notice).toBeVisible();
    await expect(notice.getByRole("link", { name: "Ver carrinho" })).toHaveAttribute("href", "/carrinho");
    expect(await stored(page)).toEqual([expect.objectContaining({ slug: "top-turbo-15w-40", label: "Frasco 1L", qty: 3 })]);
  });

  test("CART-01.2: o + do card adiciona 1 unidade da primeira embalagem", async ({ page }) => {
    await page.goto("/produtos");
    await page.getByRole("button", { name: "Adicionar Mobil Super 5W-30 Sintético ao carrinho" }).click();
    await expect(page.getByRole("main").getByText("Adicionado ao carrinho")).toBeVisible();
    // o Super tem Frasco 1L e Frasco 4L; a primeira do cadastro é o Frasco 1L
    expect(await stored(page)).toEqual([expect.objectContaining({ slug: "super-5w-30-sintetico", label: "Frasco 1L", qty: 1 })]);
  });

  test("CART-01.4: o contador do topo soma as quantidades e some com o carrinho vazio", async ({ page }) => {
    await page.goto("/produtos");
    await expect(badge(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Adicionar Mobil Super 5W-30 Sintético ao carrinho" }).click();
    await expect(badge(page)).toHaveText("1");
    await page.goto("/produtos/top-turbo-15w-40");
    for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await expect(badge(page)).toHaveText("4");
    await expect(page.getByRole("banner").getByRole("link", { name: "Carrinho, 4 itens" })).toBeVisible();
    // esvaziado em outro lugar (outra aba), o contador some
    await page.evaluate(() => {
      window.localStorage.removeItem("faclub:carrinho");
    });
    await page.reload();
    await expect(badge(page)).toHaveCount(0);
  });
});

/** Põe linhas no carrinho direto no armazenamento, como se tivessem sido adicionadas agora. */
async function fillCart(page: Page, lines: Awaited<ReturnType<typeof cartLine>>[], updatedAt = new Date().toISOString()) {
  await page.goto("/politica-de-privacidade");
  await page.evaluate(
    ([l, at]) => window.localStorage.setItem("faclub:carrinho", JSON.stringify({ version: 1, updatedAt: at, lines: l })),
    [lines, updatedAt] as const,
  );
}
const row = (page: Page, name: string) => page.getByRole("listitem", { name });
const total = (page: Page) => page.getByTestId("total-estimado");

test.describe("página do carrinho", () => {
  test("CART-01.5: mudar a quantidade muda o subtotal e o total na hora", async ({ page }) => {
    await fillCart(page, [
      await cartLine("top-turbo-15w-40", "Balde 20L", 1, "Lubrax Top Turbo 15W-40"),
      await cartLine("filtro-de-ar", "Unidade", 2, "Mobil Filtro de ar"),
    ]);
    await page.goto("/carrinho");
    const top = row(page, "Lubrax Top Turbo 15W-40 · Balde 20L");
    await expect(top.getByLabel("Subtotal de Lubrax Top Turbo 15W-40", { exact: true })).toHaveText("R$ 349,90");
    await expect(total(page)).toHaveText("R$ 469,70");
    // a cotação já veio; a mudança não espera o servidor
    await page.route("**/api/carrinho", (route) => route.abort());
    await top.getByRole("button", { name: "Aumentar quantidade de Lubrax Top Turbo 15W-40" }).click();
    await top.getByRole("button", { name: "Aumentar quantidade de Lubrax Top Turbo 15W-40" }).click();
    await expect(top.getByLabel("Quantidade de Lubrax Top Turbo 15W-40", { exact: true })).toHaveText("3");
    await expect(top.getByLabel("Subtotal de Lubrax Top Turbo 15W-40", { exact: true })).toHaveText("R$ 1.049,70");
    await expect(total(page)).toHaveText("R$ 1.169,50");
    await top.getByRole("button", { name: "Diminuir quantidade de Lubrax Top Turbo 15W-40" }).click();
    await expect(total(page)).toHaveText("R$ 819,60");
  });

  test("CART-01.6: Remover tira o item do carrinho", async ({ page }) => {
    await fillCart(page, [
      await cartLine("top-turbo-15w-40", "Balde 20L", 1, "Lubrax Top Turbo 15W-40"),
      await cartLine("filtro-de-ar", "Unidade", 2, "Mobil Filtro de ar"),
    ]);
    await page.goto("/carrinho");
    await expect(total(page)).toHaveText("R$ 469,70");
    await page.getByRole("button", { name: "Remover Lubrax Top Turbo 15W-40 · Balde 20L" }).click();
    await expect(page.getByRole("list", { name: "Itens do carrinho" }).getByRole("listitem")).toHaveCount(1);
    await expect(total(page)).toHaveText("R$ 119,80");
    await expect(badge(page)).toHaveText("2");
    await page.getByRole("button", { name: "Remover Mobil Filtro de ar · Unidade" }).click();
    await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
    await expect(badge(page)).toHaveCount(0);
    expect(await stored(page)).toEqual([]);
  });

  test("CART-01.7: fechar o navegador e voltar em até 7 dias mantém os itens", async ({ context, page }) => {
    const start = new Date("2026-11-02T10:00:00Z");
    await context.clock.install({ time: start });
    await page.goto("/produtos/top-turbo-15w-40");
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await page.goto("/produtos");
    await page.getByRole("button", { name: "Adicionar Mobil Super 5W-30 Sintético ao carrinho" }).click();
    await page.close();

    await context.clock.setSystemTime(new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000));
    const again = await context.newPage();
    await again.goto("/carrinho");
    await expect(again.getByRole("list", { name: "Itens do carrinho" }).getByRole("listitem")).toHaveText([
      /Lubrax Top Turbo 15W-40[^]*Balde 20L/,
      /Mobil Super 5W-30 Sintético[^]*Frasco 1L/,
    ]);
    await expect(badge(again)).toHaveText("2");
  });

  test("CART-01.9: carrinho vazio mostra a mensagem e Ver produtos", async ({ page }) => {
    await page.goto("/carrinho");
    await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Ver produtos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
  });

  test("CART-01.11: o carrinho busca o preço atual e marca Indisponível o que saiu do site", async ({ page }) => {
    await fillCart(page, [
      await cartLine("top-turbo-15w-40", "Frasco 1L", 1, "Lubrax Top Turbo 15W-40"),
      await cartLine("rimula-r4-15w-40", "Balde 20L", 1, "Shell Rimula R4 15W-40"),
      { productId: "00000000-0000-4000-8000-000000000000", slug: "apagado", title: "Produto apagado", label: "Frasco 1L", qty: 1 },
    ]);
    const db = serviceClient();
    await db.from("products").update({ is_visible: false }).eq("slug", "rimula-r4-15w-40");
    const { data: top } = await db.from("products").select("id").eq("slug", "top-turbo-15w-40").single();
    await db.from("product_variants").update({ price: 42.5 }).eq("product_id", top!.id).eq("label", "Frasco 1L");
    await refreshSite();
    await page.goto("/carrinho");
    await expect(row(page, "Shell Rimula R4 15W-40 · Balde 20L").getByText("Indisponível")).toBeVisible();
    await expect(row(page, "Produto apagado · Frasco 1L").getByText("Indisponível")).toBeVisible();
    await expect(row(page, "Lubrax Top Turbo 15W-40 · Frasco 1L")).toContainText("R$ 42,50 cada");
    await expect(total(page)).toHaveText("R$ 42,50");
  });

  test("CART-04.1: o carrinho avisa que preço e disponibilidade são confirmados no WhatsApp", async ({ page }) => {
    await fillCart(page, [await cartLine("filtro-de-ar", "Unidade", 1, "Mobil Filtro de ar")]);
    await page.goto("/carrinho");
    await expect(page.getByRole("complementary", { name: "Resumo do pedido" })).toContainText(
      "Preço e disponibilidade são confirmados no atendimento pelo WhatsApp.",
    );
  });

  test("CART-04.13: com cupom ativo aparece a caixa do cupom desmarcada; sem cupom, some", async ({ page }) => {
    await fillCart(page, [await cartLine("filtro-de-ar", "Unidade", 1, "Mobil Filtro de ar")]);
    await page.goto("/carrinho");
    const box = page.getByRole("checkbox", { name: "Quero fazer a troca na loja com o cupom FACLUB10" });
    await expect(box).toBeVisible();
    await expect(box).not.toBeChecked();
    await serviceClient().from("coupons").update({ is_active: false }).eq("code", "FACLUB10");
    await refreshSite();
    await page.goto("/carrinho");
    await expect(page.getByTestId("total-estimado")).toHaveText("R$ 59,90");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  });
});
