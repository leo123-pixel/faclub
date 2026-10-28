import { expect, test, type Page } from "@playwright/test";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

const main = (page: Page) => page.getByRole("main");

test.beforeEach(async () => {
  await seedSite();
});

test.describe("Home", () => {
  test("HOME-01.2: o topo mostra título, texto, foto e link do banner ativo", async ({ page }) => {
    await serviceClient()
      .from("banners")
      .update({ title: "Oferta da semana", subtitle: "Mobil Super com preço de balde.", link: "/produtos?categoria=linha-leve" })
      .eq("position", 1);
    await refreshSite();
    await page.goto("/");
    const hero = page.getByRole("region", { name: "Oferta da semana" });
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Oferta da semana");
    await expect(hero).toContainText("Mobil Super com preço de balde.");
    const photo = hero.getByRole("img", { name: "Oferta da semana" });
    await expect(photo).toHaveAttribute("src", /\/storage\/v1\/object\/public\/product-images\/banners\/seed-topo\.webp$/);
    expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(hero.getByRole("link", { name: "Saiba mais" })).toHaveAttribute("href", "/produtos?categoria=linha-leve");
  });

  test("HOME-01.3: a faixa mostra horários, endereço e o cupom ativo", async ({ page }) => {
    await page.goto("/");
    const facts = page.getByRole("list", { name: "Horários, endereço e cupom" }).getByRole("listitem");
    await expect(facts).toHaveText([
      "Seg a Sex7h às 18h",
      "Sábado8h às 13h",
      "EndereçoR. Cabo Antônio Alves, 50",
      "Cupom de desconto10% OFF · FACLUB10",
    ]);
  });

  test("HOME-01.4: a seção de marcas lista as marcas cadastradas", async ({ page }) => {
    await serviceClient().from("brands").insert({ name: "Ipiranga" });
    await refreshSite();
    await page.goto("/");
    // em ordem alfabética: a tabela de marcas não tem campo de ordem
    await expect(page.getByRole("list", { name: "Marcas" }).getByRole("listitem")).toHaveText([
      "Brutus",
      "Ipiranga",
      "Lubrax",
      "Mobil",
      "Shell",
      "Texaco",
      "Urania",
    ]);
  });

  test("HOME-01.6: Ver produtos abre /produtos", async ({ page }) => {
    await page.goto("/");
    await main(page).getByRole("link", { name: "Ver produtos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
  });
});
