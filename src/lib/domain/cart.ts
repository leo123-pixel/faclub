/** Uma linha do carrinho: produto, embalagem e quantidade; título e slug servem à tela. */
export type CartLine = { productId: string; slug: string; title: string; label: string; qty: number };
export type Cart = { lines: CartLine[]; updatedAt: string | null };

export const CART_MAX_QTY = 99;
export const CART_TTL_DAYS = 7;
export const CART_STORAGE_KEY = "faclub:carrinho";
export const EMPTY_CART: Cart = { lines: [], updatedAt: null };

const clampQty = (n: number) => Math.min(CART_MAX_QTY, Math.max(1, Math.floor(n) || 1));
const same = (l: CartLine, productId: string, label: string) => l.productId === productId && l.label === label;

/** O mesmo produto e embalagem somam na linha que já existe, até 99 (CART-01 AC 3). */
export function addToCart(cart: Cart, line: CartLine, now: Date): Cart {
  const found = cart.lines.some((l) => same(l, line.productId, line.label));
  const lines = found
    ? cart.lines.map((l) => (same(l, line.productId, line.label) ? { ...l, qty: clampQty(l.qty + line.qty) } : l))
    : [...cart.lines, { ...line, qty: clampQty(line.qty) }];
  return { lines, updatedAt: now.toISOString() };
}

export function setQty(cart: Cart, productId: string, label: string, qty: number, now: Date): Cart {
  return {
    lines: cart.lines.map((l) => (same(l, productId, label) ? { ...l, qty: clampQty(qty) } : l)),
    updatedAt: now.toISOString(),
  };
}

export function removeLine(cart: Cart, productId: string, label: string, now: Date): Cart {
  return { lines: cart.lines.filter((l) => !same(l, productId, label)), updatedAt: now.toISOString() };
}

export const cartCount = (cart: Cart) => cart.lines.reduce((sum, l) => sum + l.qty, 0);

const isLine = (l: unknown): l is CartLine => {
  const x = l as CartLine;
  return (
    !!x &&
    typeof x.productId === "string" &&
    typeof x.slug === "string" &&
    typeof x.title === "string" &&
    typeof x.label === "string" &&
    Number.isInteger(x.qty) &&
    x.qty >= 1 &&
    x.qty <= CART_MAX_QTY
  );
};

/** Lê o carrinho guardado; texto inválido ou mais de 7 dias sem alteração dão carrinho vazio (CART-01 AC 8). */
export function readCart(raw: string | null, now: Date): Cart {
  if (!raw) return EMPTY_CART;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.lines) || !data.lines.every(isLine)) return EMPTY_CART;
    const updated = Date.parse(data.updatedAt);
    if (Number.isNaN(updated) || now.getTime() - updated > CART_TTL_DAYS * 24 * 60 * 60 * 1000) return EMPTY_CART;
    return { lines: data.lines, updatedAt: data.updatedAt };
  } catch {
    return EMPTY_CART;
  }
}

export const writeCart = (cart: Cart) => JSON.stringify({ version: 1, updatedAt: cart.updatedAt, lines: cart.lines });
