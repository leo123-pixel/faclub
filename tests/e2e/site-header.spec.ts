import { expect, test, type Page } from "@playwright/test";
import { seedSite } from "./support/site";

// Páginas públicas que o topo precisa cobrir; cresce com as tarefas do site.
const PAGES = ["/", "/produtos", "/produtos/top-turbo-15w-40"];

const SCHEDULE =
  "https://wa.me/551129545764?text=" + encodeURIComponent("Olá! Quero agendar uma troca de óleo.");

const header = (page: Page) => page.getByRole("banner");
const schedule = (page: Page) => header(page).getByRole("link", { name: "Agendar troca" });

test.beforeEach(async () => {
  await seedSite();
});

test.describe("topo do site", () => {
  test("HEAD-01.1: Agendar troca à vista no celular de 360 px sem rolar", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of PAGES) {
      await page.goto(path);
      await expect(schedule(page)).toBeInViewport({ ratio: 1 });
      const box = (await schedule(page).boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(360);
      // a página não rola na horizontal
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    }
  });

  test("HEAD-01.2: o topo continua fixo no alto ao rolar", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
      await expect(schedule(page)).toBeInViewport({ ratio: 1 });
      const box = (await header(page).boundingBox())!;
      expect(box.y).toBeLessThanOrEqual(12);
    }
  });

  test("HEAD-01.3: Agendar troca abre o WhatsApp das configurações com a mensagem de agendamento", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(schedule(page)).toHaveAttribute("href", SCHEDULE);
      await expect(schedule(page)).toHaveAttribute("target", "_blank");
    }
    // o botão do topo da Home usa o mesmo link
    await page.goto("/");
    await expect(page.getByRole("main").getByRole("link", { name: "Agendar pelo WhatsApp" })).toHaveAttribute("href", SCHEDULE);
  });

  test("HEAD-01.4: links Serviços, Produtos e Contato, com o da página atual em negrito", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Menu principal" });
    await expect(nav.getByRole("link")).toHaveText(["Serviços", "Produtos", "Contato"]);
    await expect(nav.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "/#servicos");
    await expect(nav.getByRole("link", { name: "Produtos" })).toHaveAttribute("href", "/produtos");
    await expect(nav.getByRole("link", { name: "Contato" })).toHaveAttribute("href", "/#contato");
    // na Home nenhum dos três é a página atual
    await expect(nav.locator("[aria-current=page]")).toHaveCount(0);
    await page.goto("/produtos");
    const current = nav.locator("[aria-current=page]");
    await expect(current).toHaveText("Produtos");
    await expect(current).toHaveCSS("font-weight", "600");
    await expect(nav.getByRole("link", { name: "Serviços" })).toHaveCSS("font-weight", "500");
  });

  test("HEAD-01.5: abaixo de 768 px os links ficam atrás de Abrir menu e Agendar troca segue à vista", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(header(page).getByRole("link", { name: "Produtos", exact: true })).toBeHidden();
    await expect(schedule(page)).toBeInViewport({ ratio: 1 });
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu.getByRole("link")).toHaveText(["Serviços", "Produtos", "Contato"]);
    await expect(schedule(page)).toBeInViewport({ ratio: 1 });
    await page.getByRole("button", { name: "Fechar menu" }).click();
    await expect(header(page).getByRole("link", { name: "Produtos", exact: true })).toBeHidden();
    // a 768 px os links voltam ao topo e o botão some
    await page.setViewportSize({ width: 768, height: 900 });
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden();
    await expect(header(page).getByRole("link", { name: "Produtos", exact: true })).toBeVisible();
  });

  test("HEAD-01.6: sacola Carrinho entre o menu e Agendar troca, levando a /carrinho", async ({ page }) => {
    await page.goto("/");
    const bag = header(page).getByRole("link", { name: "Carrinho" });
    await expect(bag).toHaveAttribute("href", "/carrinho");
    const navBox = (await page.getByRole("navigation", { name: "Menu principal" }).boundingBox())!;
    const bagBox = (await bag.boundingBox())!;
    const scheduleBox = (await schedule(page).boundingBox())!;
    expect(bagBox.x).toBeGreaterThan(navBox.x + navBox.width - 1);
    expect(bagBox.x + bagBox.width).toBeLessThanOrEqual(scheduleBox.x);
  });
});
