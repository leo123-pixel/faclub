import { expect, type Page } from "@playwright/test";
import { USERS } from "./seed";

export async function loginAs(page: Page, who: keyof typeof USERS = "admin") {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(USERS[who].email);
  await page.getByLabel("Senha").fill(USERS[who].password);
  await page.getByRole("button", { name: "Entrar" }).click();
  if (who === "admin") await expect(page).toHaveURL(/\/admin\/produtos/);
}
