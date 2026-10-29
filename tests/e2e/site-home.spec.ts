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

  test("HOME-01.5: Produtos em destaque mostra até 4 destaques visíveis e some sem nenhum", async ({ page }) => {
    // um quinto destaque e um destaque oculto não entram
    const db = serviceClient();
    await db.from("products").update({ is_featured: true }).in("name", ["Delvac 15W-40", "Helix Ultra 5W-40"]);
    await refreshSite();
    await page.goto("/");
    const featured = page.getByRole("list", { name: "Produtos em destaque" }).getByRole("listitem");
    await expect(featured).toHaveCount(4);
    await expect(featured.getByRole("heading")).toHaveText([
      "Super 5W-30 Sintético",
      "Top Turbo 15W-40",
      "Rimula R4 15W-40",
      "Delvac 15W-40",
    ]);
    await db.from("products").update({ is_featured: false }).neq("name", "");
    await refreshSite();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Produtos em destaque" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Por que a FAC LUB" })).toBeVisible();
  });

  test("HOME-01.6: Ver produtos e Ver todos abrem /produtos", async ({ page }) => {
    await page.goto("/");
    await expect(main(page).getByRole("link", { name: "Ver produtos" })).toHaveAttribute("href", "/produtos");
    await expect(main(page).getByRole("link", { name: "Ver todos" })).toHaveAttribute("href", "/produtos");
    await main(page).getByRole("link", { name: "Ver todos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
    await page.goto("/");
    await main(page).getByRole("link", { name: "Ver produtos" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
  });

  test("HOME-01.7: o card de um produto abre a página dele", async ({ page }) => {
    await page.goto("/");
    const featured = page.getByRole("list", { name: "Produtos em destaque" });
    await expect(featured.getByRole("link", { name: "Top Turbo 15W-40" })).toHaveAttribute("href", "/produtos/top-turbo-15w-40");
    await featured.getByRole("link", { name: "Super 5W-30 Sintético" }).click();
    await expect(page).toHaveURL(/\/produtos\/super-5w-30-sintetico$/);
  });

  test("HOME-01.8: Passa aqui na FAC LUB mostra endereço, horários, telefone, e-mail e o mapa", async ({ page }) => {
    await page.goto("/");
    const contact = page.getByRole("region", { name: "Passa aqui na FAC LUB" });
    await expect(contact).toContainText("Rua Cabo Antônio Alves, 50");
    await expect(contact).toContainText("Parque Novo Mundo, São Paulo");
    await expect(contact).toContainText("Seg a Sex, 7h às 18h");
    await expect(contact).toContainText("Sábado, 8h às 13h");
    await expect(contact).toContainText("(11) 2954-5764");
    await expect(contact).toContainText("contato@faclubrificantes.com.br");
    const map = contact.locator("iframe");
    await expect(map).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=" +
        encodeURIComponent("Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo") +
        "&output=embed",
    );
    await expect(map).toHaveAttribute("loading", "lazy");
    await expect(contact.getByRole("link", { name: "Chamar no WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/551129545764?text=" + encodeURIComponent("Olá! Vim pelo site da FAC LUB."),
    );
  });

  test("HOME-01.9: o telefone abre tel: e o e-mail abre mailto:", async ({ page }) => {
    await page.goto("/");
    const contact = page.getByRole("region", { name: "Passa aqui na FAC LUB" });
    await expect(contact.getByRole("link", { name: "(11) 2954-5764" })).toHaveAttribute("href", "tel:+551129545764");
    await expect(contact.getByRole("link", { name: "contato@faclubrificantes.com.br" })).toHaveAttribute(
      "href",
      "mailto:contato@faclubrificantes.com.br",
    );
  });

  test("HOME-01.11: Instagram e grupo vazios escondem os botões; preenchidos, eles aparecem", async ({ page }) => {
    await serviceClient().from("settings").update({ group_link: null, instagram: null }).eq("id", 1);
    await refreshSite();
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Entrar no grupo de ofertas" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Instagram" })).toHaveCount(0);
    await serviceClient()
      .from("settings")
      .update({ group_link: "https://chat.whatsapp.com/ofertas", instagram: "https://instagram.com/faclub" })
      .eq("id", 1);
    await refreshSite();
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Entrar no grupo de ofertas" })).toHaveAttribute(
      "href",
      "https://chat.whatsapp.com/ofertas",
    );
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/faclub",
    );
  });
});
