import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed({ products: false });
});

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Configurações" }).click();
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
}

test.describe("configurações da loja", () => {
  test("CONF-01.1: o formulário abre com os valores atuais", async ({ page }) => {
    await open(page);
    await expect(page.getByLabel("WhatsApp")).toHaveValue("(11) 2954-5764");
    await expect(page.getByLabel("Telefone")).toHaveValue("(11) 2954-5764");
    await expect(page.getByLabel("E-mail")).toHaveValue("contato@faclubrificantes.com.br");
    await expect(page.getByLabel("Endereço")).toHaveValue("Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo");
    await expect(page.getByLabel("Horário de segunda a sexta")).toHaveValue("7h às 18h");
    await expect(page.getByLabel("Horário de sábado")).toHaveValue("8h às 13h");
    await expect(page.getByLabel("Link do grupo de ofertas")).toHaveValue("");
    await expect(page.getByLabel("Instagram")).toHaveValue("");
    await expect(page.getByLabel("Mensagem de agendamento")).toHaveValue("Olá! Quero agendar uma troca de óleo.");
  });

  test("CONF-01.2: salvar grava a linha de settings e mostra Configurações salvas.", async ({ page }) => {
    await open(page);
    await page.getByLabel("Horário de sábado").fill("8h às 12h");
    await page.getByLabel("WhatsApp").fill("(11) 99999-0000");
    await page.getByLabel("Link do grupo de ofertas").fill("https://chat.whatsapp.com/ofertas");
    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByRole("status")).toHaveText("Configurações salvas.");
    await page.reload();
    await expect(page.getByLabel("Horário de sábado")).toHaveValue("8h às 12h");
    await expect(page.getByLabel("WhatsApp")).toHaveValue("(11) 99999-0000");
    const { data } = await serviceClient().from("settings").select("whatsapp, hours_saturday, group_link");
    expect(data).toEqual([
      { whatsapp: "11999990000", hours_saturday: "8h às 12h", group_link: "https://chat.whatsapp.com/ofertas" },
    ]);
  });

  test("WhatsApp com 9 dígitos mostra a mensagem e não grava", async ({ page }) => {
    await open(page);
    await page.getByLabel("WhatsApp").fill("(11) 2954-576");
    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Informe o WhatsApp com DDD, por exemplo (11) 2954-5764.",
    );
    const { data } = await serviceClient().from("settings").select("whatsapp").single();
    expect(data).toEqual({ whatsapp: "1129545764" });
  });
});
