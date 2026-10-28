import { describe, expect, it } from "vitest";
import { filterOrders, formatOrderDate, isOrderStatus, orderItemsSummary, ORDER_STATUSES, type AdminOrder } from "./admin-orders";

const order = (id: number, status: AdminOrder["status"]): AdminOrder => ({
  id,
  createdAt: `2026-10-2${id}T12:00:00Z`,
  items: [],
  total: 10,
  name: null,
  vehicle: null,
  coupon: null,
  status,
});

describe("lista de pedidos", () => {
  it("filtra por status e mostra todos sem filtro", () => {
    const orders = [order(1, "Novo"), order(2, "Atendido"), order(3, "Cancelado"), order(4, "Novo")];
    expect(filterOrders(orders, "Novo").map((o) => o.id)).toEqual([1, 4]);
    expect(filterOrders(orders, "Atendido").map((o) => o.id)).toEqual([2]);
    expect(filterOrders(orders, "Cancelado").map((o) => o.id)).toEqual([3]);
    expect(filterOrders(orders, "")).toHaveLength(4);
    expect(ORDER_STATUSES).toEqual(["Novo", "Atendido", "Cancelado"]);
    expect(isOrderStatus("Atendido")).toBe(true);
    expect(isOrderStatus("atendido")).toBe(false);
  });

  it("resume os itens com quantidade, título e embalagem", () => {
    expect(
      orderItemsSummary([
        { title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2 },
        { title: "Mobil Filtro de óleo", label: "Unidade", qty: 1 },
      ]),
    ).toEqual(["2× Lubrax Top Turbo 15W-40 · Balde 20L", "1× Mobil Filtro de óleo · Unidade"]);
  });

  it("data e hora no horário de São Paulo", () => {
    expect(formatOrderDate("2026-10-28T17:05:00Z")).toBe("28/10/2026 14:05");
    expect(formatOrderDate("2026-10-29T02:30:00Z")).toBe("28/10/2026 23:30");
  });
});
