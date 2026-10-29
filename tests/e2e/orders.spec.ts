import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { seed } from "./support/seed";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seed({ products: false });
});

const item = (title: string, label: string, qty: number, price: number) => ({ productId: "x", title, label, qty, price, subtotal: price * qty });

/** Três pedidos em horas diferentes; devolve os ids na ordem de criação. */
async function addOrders() {
  const db = serviceClient();
  const rows: Record<string, unknown>[] = [
    { created_at: "2026-10-26T13:00:00Z", items: [item("Mobil Filtro de ar", "Unidade", 1, 59.9)], total_estimated: 59.9, status: "Atendido" },
    {
      created_at: "2026-10-27T13:00:00Z",
      items: [item("Lubrax Top Turbo 15W-40", "Balde 20L", 2, 349.9), item("Mobil Filtro de ar", "Unidade", 1, 59.9)],
      total_estimated: 759.7,
      customer_name: "João",
      vehicle: "ABC1D23",
      coupon_code: "FACLUB10",
      status: "Novo",
    },
    { created_at: "2026-10-28T17:05:00Z", items: [item("Shell Rimula R4 15W-40", "Balde 20L", 1, 459.9)], total_estimated: 459.9, status: "Novo" },
  ];
  const ids: number[] = [];
  for (const r of rows) {
    const { data, error } = await db.from("orders").insert(r).select("id").single();
    if (error) throw error;
    ids.push(data.id);
  }
  return ids;
}

async function open(page: Page) {
  await loginAs(page);
  await page.getByRole("navigation", { name: "Menu do painel" }).getByRole("link", { name: "Pedidos" }).click();
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
}

const cards = (page: Page) => page.getByRole("list", { name: "Pedidos" }).getByRole("listitem", { name: /^Pedido nº/ });

test.describe("pedidos no painel", () => {
  test("ORD-01.1: lista do mais novo ao mais antigo com número, data e hora, itens, total, nome, veículo, cupom e status", async ({ page }) => {
    const [first, second, third] = await addOrders();
    await open(page);
    await expect(cards(page)).toHaveCount(3);
    expect(await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).toEqual([
      `Pedido nº ${third}`,
      `Pedido nº ${second}`,
      `Pedido nº ${first}`,
    ]);
    const card = page.getByRole("listitem", { name: `Pedido nº ${second}` });
    await expect(card).toContainText(`Pedido nº ${second}`);
    await expect(card).toContainText("27/10/2026 10:00");
    await expect(card.getByRole("list", { name: "Itens" }).getByRole("listitem")).toHaveText([
      "2× Lubrax Top Turbo 15W-40 · Balde 20L",
      "1× Mobil Filtro de ar · Unidade",
    ]);
    await expect(card).toContainText("R$ 759,70");
    await expect(card).toContainText("João");
    await expect(card).toContainText("ABC1D23");
    await expect(card).toContainText("FACLUB10");
    await expect(card.getByRole("combobox", { name: `Status do pedido nº ${second}` })).toHaveValue("Novo");
    await expect(page.getByRole("combobox", { name: `Status do pedido nº ${first}` })).toHaveValue("Atendido");
  });

  test("ORD-01.5: sem pedidos a lista mostra Nenhum pedido ainda.", async ({ page }) => {
    await open(page);
    await expect(page.getByText("Nenhum pedido ainda.")).toBeVisible();
    await expect(page.getByRole("list", { name: "Pedidos" })).toHaveCount(0);
  });

  test("ORD-01.2: mudar o status grava sem recarregar a página", async ({ page }) => {
    const [, second] = await addOrders();
    await open(page);
    await page.evaluate(() => ((window as unknown as { __marca: boolean }).__marca = true));
    const select = page.getByRole("combobox", { name: `Status do pedido nº ${second}` });
    await select.selectOption("Atendido");
    await expect(select).toHaveValue("Atendido");
    await expect(select).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { __marca?: boolean }).__marca)).toBe(true);
    const { data } = await serviceClient().from("orders").select("status").eq("id", second).single();
    expect(data).toEqual({ status: "Atendido" });
    await page.reload();
    await expect(page.getByRole("combobox", { name: `Status do pedido nº ${second}` })).toHaveValue("Atendido");
  });

  test("ORD-01.3: o filtro por status mostra só os pedidos daquele status", async ({ page }) => {
    const [first, second, third] = await addOrders();
    await open(page);
    const filters = page.getByRole("navigation", { name: "Filtrar por status" });
    await filters.getByRole("link", { name: "Atendido" }).click();
    await expect(page).toHaveURL(/status=Atendido$/);
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page)).toHaveAttribute("aria-label", `Pedido nº ${first}`);
    await filters.getByRole("link", { name: "Novo" }).click();
    await expect(page).toHaveURL(/status=Novo$/);
    await expect(cards(page)).toHaveCount(2);
    expect(await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).toEqual([
      `Pedido nº ${third}`,
      `Pedido nº ${second}`,
    ]);
    await filters.getByRole("link", { name: "Cancelado" }).click();
    await expect(page).toHaveURL(/status=Cancelado$/);
    await expect(page.getByText("Nenhum pedido com o status Cancelado.")).toBeVisible();
    await filters.getByRole("link", { name: "Todos" }).click();
    await expect(page).toHaveURL(/\/admin\/pedidos$/);
    await expect(cards(page)).toHaveCount(3);
  });
});

