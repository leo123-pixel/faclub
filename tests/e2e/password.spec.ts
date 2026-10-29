import { expect, test } from "@playwright/test";
import pg from "pg";
import { DB_URL } from "../../scripts/local-supabase/config.mjs";
import { latestLink } from "./support/mail";
import { seed, USERS } from "./support/seed";

const SENT = "Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.";

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await seed({ products: false }); // devolve a senha do admin
});

/** O Auth só manda um e-mail de recuperação por minuto por conta; o teste zera a espera. */
async function allowNewEmail(email: string) {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  await client.query("update auth.users set recovery_sent_at = null where email = $1", [email]);
  await client.end();
}

async function requestReset(page: import("@playwright/test").Page, email: string) {
  await page.goto("/admin/esqueci-senha");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("button", { name: "Enviar link" }).click();
}

test.describe("recuperação de senha", () => {
  test("AUTH-01.5: e-mail cadastrado e não cadastrado mostram a mesma mensagem", async ({ page }) => {
    await requestReset(page, USERS.admin.email);
    await expect(page.getByRole("status")).toHaveText(SENT);
    await requestReset(page, "ninguem@faclub.local");
    await expect(page.getByRole("status")).toHaveText(SENT);
  });

  test("AUTH-01.6: o link do e-mail leva à nova senha e 8 caracteres entram no painel", async ({ page }) => {
    await allowNewEmail(USERS.admin.email);
    const since = Date.now();
    await requestReset(page, USERS.admin.email);
    await expect(page.getByRole("status")).toHaveText(SENT);

    await page.goto(await latestLink(USERS.admin.email, since));
    await expect(page).toHaveURL(/\/admin\/nova-senha$/);

    await page.getByLabel("Nova senha").fill("1234567");
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Use ao menos 8 caracteres.");

    await page.getByLabel("Nova senha").fill("nova-senha-8");
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page).toHaveURL(/\/admin\/produtos$/);
  });
});
