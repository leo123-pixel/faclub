export const ORDER_STATUSES = ["Novo", "Atendido", "Cancelado"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (v: unknown): v is OrderStatus => ORDER_STATUSES.includes(v as OrderStatus);

export type AdminOrder = {
  id: number;
  createdAt: string;
  items: { title: string; label: string; qty: number }[];
  total: number;
  name: string | null;
  vehicle: string | null;
  coupon: string | null;
  status: OrderStatus;
};

/** Sem status (""), todos. */
export const filterOrders = (orders: AdminOrder[], status: OrderStatus | "") =>
  status ? orders.filter((o) => o.status === status) : orders;

export const orderItemsSummary = (items: AdminOrder["items"]) => items.map((i) => `${i.qty}× ${i.title} · ${i.label}`);
