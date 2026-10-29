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

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "28/10/2026 14:05", no horário de São Paulo. */
export const formatOrderDate = (iso: string) => dateTime.format(new Date(iso)).replace(",", "");
