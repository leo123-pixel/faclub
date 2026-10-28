import { expect, test, type Page } from "@playwright/test";
import { pngFile } from "./support/images";
import { loginAs } from "./support/login";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

// O painel grava e o site precisa mostrar a mudança em até 1 minuto: cada
// verificação recarrega a página pública até 60 s.
test.setTimeout(150_000);

test.beforeEach(async () => {
  await seedSite();
});

const menu = (page: Page, name: string) =>
  page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name }).click();

/** Abre `path` de novo até a verificação passar, por no máximo 60 s. */
async function withinAMinute(page: Page, path: string, check: () => Promise<void>) {
  await expect(async () => {
    await page.goto(path);
    await check();
  }).toPass({ timeout: 60_000, intervals: [1_000, 2_000, 5_000] });
}

const hero = (page: Page) => page.getByRole("main").getByRole("heading", { level: 1 });
const facts = (page: Page) => page.getByRole("list", { name: "Horários, endereço e cupom" });

async function editBannerTitle(page: Page, from: string, to: string) {
  await menu(page, "Banners e ofertas");
  await page.getByRole("listitem", { name: from }).getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Título").fill(to);
  await page.getByRole("button", { name: "Salvar banner" }).click();
  await expect(page.getByRole("status")).toHaveText("Banner salvo.");
}

test.describe("o site acompanha o painel", () => {
  test("HOME-01.12: banner, cupom e configurações salvos no painel aparecem na Home", async ({ page }) => {
    await loginAs(page);
    await editBannerTitle(page, "Troca de óleo e filtros com quem entende do assunto", "Semana do diesel");

    await menu(page, "Cupons");
    await page.getByRole("listitem", { name: "FACLUB10" }).getByRole("button", { name: "Editar" }).click();
    const form = page.getByRole("form", { name: "Editar cupom" });
    await form.getByLabel("Percentual (%)").fill("15");
    await form.getByRole("button", { name: "Salvar cupom" }).click();
    await expect(page.getByRole("status")).toHaveText("Cupom salvo.");

    await menu(page, "Configurações");
    await page.getByLabel("Horário de sábado").fill("8h às 12h");
    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByRole("status")).toHaveText("Configurações salvas.");

    await withinAMinute(page, "/", async () => {
      await expect(hero(page)).toHaveText("Semana do diesel", { timeout: 1_000 });
      await expect(facts(page)).toContainText("15% OFF · FACLUB10", { timeout: 1_000 });
      await expect(facts(page)).toContainText("Sábado8h às 12h", { timeout: 1_000 });
    });
  });

  test("HOME-01.13: desativar o único banner ativo mostra o topo padrão", async ({ page }) => {
    await serviceClient().from("banners").update({ title: "Semana do diesel" }).eq("position", 1);
    await refreshSite();
    await page.goto("/");
    await expect(hero(page)).toHaveText("Semana do diesel");

    await loginAs(page);
    await menu(page, "Banners e ofertas");
    const active = page.getByRole("switch", { name: "Ativo: Semana do diesel" });
    await active.click();
    await expect(active).toHaveAttribute("aria-checked", "false");
    await expect(active).toBeEnabled();

    await withinAMinute(page, "/", async () => {
      await expect(hero(page)).toHaveText("Troca de óleo e filtros com quem entende do assunto", { timeout: 1_000 });
      await expect(page.getByRole("img", { name: "Box de serviço com carro no elevador" })).toBeVisible({ timeout: 1_000 });
    });
  });

  test("HOME-01.14: sem cupom ativo, a Home e a página do produto escondem os blocos de cupom", async ({ page }) => {
    await loginAs(page);
    await menu(page, "Cupons");
    const active = page.getByRole("switch", { name: "Ativo: FACLUB10" });
    await active.click();
    await expect(active).toHaveAttribute("aria-checked", "false");
    await expect(active).toBeEnabled();

    await withinAMinute(page, "/", async () => {
      await expect(page.getByRole("region", { name: "Cupom de desconto" })).toHaveCount(0, { timeout: 1_000 });
      await expect(facts(page).getByRole("listitem")).toHaveCount(3, { timeout: 1_000 });
      await expect(page.getByText("FACLUB10")).toHaveCount(0, { timeout: 1_000 });
    });
    await withinAMinute(page, "/produtos/top-turbo-15w-40", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Top Turbo 15W-40", { timeout: 1_000 });
      await expect(page.getByText("FACLUB10")).toHaveCount(0, { timeout: 1_000 });
      await expect(page.getByText("10% de desconto na troca feita na loja.")).toHaveCount(0, { timeout: 1_000 });
    });
  });

  test("HOME-01.15: mudar o WhatsApp muda todos os botões de WhatsApp do site", async ({ page }) => {
    await loginAs(page);
    await menu(page, "Configurações");
    await page.getByLabel("WhatsApp").fill("(11) 99999-0000");
    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByRole("status")).toHaveText("Configurações salvas.");

    const buttons = ["Agendar troca", "Agendar pelo WhatsApp", "Pedir orçamento", "Chamar no WhatsApp"];
    await withinAMinute(page, "/", async () => {
      for (const name of buttons) {
        await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", /^https:\/\/wa\.me\/5511999990000\?text=/, {
          timeout: 1_000,
        });
      }
      const all = await page.locator('a[href^="https://wa.me/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      expect(all.length).toBeGreaterThanOrEqual(buttons.length);
      expect(all.every((href) => href!.startsWith("https://wa.me/5511999990000"))).toBe(true);
    });
    for (const path of ["/produtos", "/produtos/top-turbo-15w-40", "/politica-de-privacidade"]) {
      await withinAMinute(page, path, async () => {
        await expect(page.getByRole("banner").getByRole("link", { name: "Agendar troca" })).toHaveAttribute(
          "href",
          /^https:\/\/wa\.me\/5511999990000\?text=/,
          { timeout: 1_000 },
        );
      });
    }
  });

  test("CAT-01.15: um produto salvo com Visível no site ligado aparece no catálogo", async ({ page }) => {
    await loginAs(page);
    await page.getByRole("link", { name: "Novo produto" }).first().click();
    await page.getByLabel("Nome do produto").fill("Extra Diesel 15W-40");
    await page.getByLabel("Marca").selectOption({ label: "Lubrax" });
    await page.getByLabel("Categoria").selectOption({ label: "Linha pesada" });
    await page.getByRole("button", { name: "Balde 20L" }).click();
    await page.getByRole("group", { name: "Balde 20L" }).getByLabel("Preço (R$)").fill("409,90");
    await page.getByLabel("Enviar fotos").setInputFiles(await pngFile(page, "foto.png", 1200, 900));
    await expect(page.getByRole("region", { name: "Fotos" }).getByText("Capa")).toBeVisible();
    await expect(page.getByRole("region", { name: "Fotos" }).getByText("Enviando…")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Publicação" }).getByRole("switch", { name: "Visível no site" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByRole("status")).toHaveText("Produto salvo.");

    await withinAMinute(page, "/produtos", async () => {
      await expect(page.getByText("13 produtos")).toBeVisible({ timeout: 1_000 });
      await expect(page.getByRole("heading", { name: "Extra Diesel 15W-40" })).toBeVisible({ timeout: 1_000 });
    });
    await withinAMinute(page, "/produtos/extra-diesel-15w-40", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Extra Diesel 15W-40", { timeout: 1_000 });
    });
  });

  test("CAT-01.16: visibilidade, oferta e preço mudados no painel aparecem no catálogo, no produto e na Home", async ({ page }) => {
    await loginAs(page);
    const table = page.locator("table");
    // oculta o Rimula (destaque da Home)
    const visible = table.getByRole("switch", { name: "Visível no site: Shell Rimula R4 15W-40" });
    await visible.click();
    await expect(visible).toHaveAttribute("aria-checked", "false");
    await expect(visible).toBeEnabled();
    // tira a oferta do Top Turbo
    const promo = table.getByRole("switch", { name: "Em oferta: Lubrax Top Turbo 15W-40" });
    await promo.click();
    await expect(promo).toHaveAttribute("aria-checked", "false");
    await expect(promo).toBeEnabled();
    // muda o preço promocional do Super (em oferta) de 49,90 para 47,90
    await page.getByRole("row", { name: "Mobil Super 5W-30 Sintético" }).getByRole("link", { name: "Editar" }).click();
    await page.getByRole("group", { name: "Frasco 1L" }).getByLabel("Preço promocional (R$)").fill("47,90");
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByRole("status")).toHaveText("Produto salvo.");

    const card = (name: string) => page.getByRole("listitem").filter({ has: page.getByRole("heading", { name, exact: true }) });
    await withinAMinute(page, "/produtos", async () => {
      await expect(page.getByRole("heading", { name: "Rimula R4 15W-40" })).toHaveCount(0, { timeout: 1_000 });
      await expect(card("Top Turbo 15W-40").getByText("Oferta", { exact: true })).toHaveCount(0, { timeout: 1_000 });
      await expect(card("Top Turbo 15W-40")).toContainText("R$ 389,90", { timeout: 1_000 });
      await expect(card("Super 5W-30 Sintético")).toContainText("R$ 47,90", { timeout: 1_000 });
    });
    await withinAMinute(page, "/produtos/rimula-r4-15w-40", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produto não encontrado.", { timeout: 1_000 });
    });
    await withinAMinute(page, "/produtos/top-turbo-15w-40", async () => {
      await expect(page.getByText("Oferta da semana")).toHaveCount(0, { timeout: 1_000 });
      await expect(page.getByText("R$ 389,90", { exact: true })).toBeVisible({ timeout: 1_000 });
    });
    await withinAMinute(page, "/produtos/super-5w-30-sintetico", async () => {
      await expect(page.getByText("R$ 47,90", { exact: true })).toBeVisible({ timeout: 1_000 });
    });
    await withinAMinute(page, "/", async () => {
      const featured = page.getByRole("list", { name: "Produtos em destaque" });
      await expect(featured.getByRole("heading")).toHaveText(["Super 5W-30 Sintético", "Top Turbo 15W-40", "Filtro de óleo"], {
        timeout: 1_000,
      });
      await expect(card("Super 5W-30 Sintético")).toContainText("R$ 47,90", { timeout: 1_000 });
      await expect(card("Top Turbo 15W-40").getByText("Oferta", { exact: true })).toHaveCount(0, { timeout: 1_000 });
    });
  });

  test("CAT-01.17: a ordem das categorias do painel vale no filtro do catálogo", async ({ page }) => {
    await loginAs(page);
    await menu(page, "Categorias");
    await page.getByRole("listitem", { name: "Filtros" }).getByRole("button", { name: "Subir" }).click();
    await expect(page.getByRole("listitem", { name: "Filtros" })).toBeVisible();
    await page.waitForLoadState("networkidle");

    await withinAMinute(page, "/produtos", async () => {
      await expect(page.getByRole("group", { name: "Categorias" }).getByRole("button")).toHaveText(
        ["Todos", "Linha leve", "Filtros", "Linha pesada", "Aditivos e graxas"],
        { timeout: 1_000 },
      );
    });
  });
});
