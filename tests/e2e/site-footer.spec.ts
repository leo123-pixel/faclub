import { expect, test, type Page } from "@playwright/test";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

// Páginas públicas que o rodapé precisa cobrir; cresce com as tarefas do site.
const PAGES = ["/", "/produtos", "/produtos/top-turbo-15w-40", "/politica-de-privacidade", "/carrinho"];

const footer = (page: Page) => page.getByRole("contentinfo");

test.beforeEach(async () => {
  await seedSite();
});

test.describe("rodapé e política de privacidade", () => {
  test("HOME-01.10: o rodapé da Home tem o ano, Instagram, Produtos, Política de privacidade e Área administrativa", async ({ page }) => {
    await serviceClient().from("settings").update({ instagram: "https://instagram.com/faclub" }).eq("id", 1);
    await refreshSite();
    await page.goto("/");
    await expect(footer(page)).toContainText(`© ${new Date().getFullYear()} FAC Lubrificantes`);
    await expect(footer(page).getByRole("link")).toHaveText([
      "Instagram",
      "Produtos",
      "Política de privacidade",
      "Área administrativa",
    ]);
    await expect(footer(page).getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "https://instagram.com/faclub");
    await expect(footer(page).getByRole("link", { name: "Produtos" })).toHaveAttribute("href", "/produtos");
    await expect(footer(page).getByRole("link", { name: "Área administrativa" })).toHaveAttribute("href", "/admin");
  });

  test("PRIV-01.1: a política mostra os dados do pedido, a finalidade, os cookies e o e-mail das configurações", async ({ page }) => {
    await serviceClient().from("settings").update({ email: "privacidade@faclub.com.br" }).eq("id", 1);
    await refreshSite();
    await page.goto("/politica-de-privacidade");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("Política de privacidade");
    await expect(main).toContainText("Seu nome e o seu veículo só são guardados se você preencher esses campos");
    await expect(main).toContainText("Usamos esses dados só para separar os produtos, atender você pelo WhatsApp");
    await expect(main).toContainText("Google Analytics 4 (GA4)");
    await expect(main).toContainText("Meta Pixel");
    await expect(main).toContainText(
      "o site guarda por 10 minutos uma versão cifrada do endereço de internet (IP) de quem envia um pedido. Depois disso ela é apagada, e o pedido em si não guarda o IP.",
    );
    await expect(main.getByRole("link", { name: "privacidade@faclub.com.br" })).toHaveAttribute(
      "href",
      "mailto:privacidade@faclub.com.br",
    );
  });

  test("PRIV-01.2: o rodapé de todas as páginas públicas tem Política de privacidade", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const link = footer(page).getByRole("link", { name: "Política de privacidade" });
      await expect(link).toHaveAttribute("href", "/politica-de-privacidade");
    }
    await page.goto("/");
    await footer(page).getByRole("link", { name: "Política de privacidade" }).click();
    await expect(page).toHaveURL(/\/politica-de-privacidade$/);
  });

  test("/contato leva à seção de contato da Home", async ({ page }) => {
    await page.goto("/contato");
    await expect(page).toHaveURL(/\/#contato$/);
  });
});
