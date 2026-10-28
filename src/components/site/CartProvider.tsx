"use client";

import { useSyncExternalStore } from "react";
import {
  addToCart,
  cartCount,
  CART_STORAGE_KEY,
  EMPTY_CART,
  readCart,
  removeLine,
  setQty,
  writeCart,
  type Cart,
  type CartLine,
} from "@/lib/domain/cart";

// O carrinho mora no localStorage (7 dias, CART-01 AC 7 e 8). Se o navegador
// bloquear o armazenamento, ele fica só na memória durante a visita (AC 10).

let current: Cart | null = null;
const listeners = new Set<() => void>();

function load(): Cart {
  try {
    return readCart(window.localStorage.getItem(CART_STORAGE_KEY), new Date());
  } catch {
    return EMPTY_CART;
  }
}

function snapshot(): Cart {
  if (current === null) current = load();
  return current;
}

function save(next: Cart) {
  current = next;
  try {
    if (next.lines.length === 0) window.localStorage.removeItem(CART_STORAGE_KEY);
    else window.localStorage.setItem(CART_STORAGE_KEY, writeCart(next));
  } catch {
    // sem armazenamento: o carrinho continua na memória
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // outra aba mudou o carrinho
  const onStorage = (e: StorageEvent) => {
    if (e.key !== CART_STORAGE_KEY) return;
    current = load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const cartActions = {
  add: (line: CartLine) => save(addToCart(snapshot(), line, new Date())),
  setQty: (productId: string, label: string, qty: number) => save(setQty(snapshot(), productId, label, qty, new Date())),
  remove: (productId: string, label: string) => save(removeLine(snapshot(), productId, label, new Date())),
  clear: () => save(EMPTY_CART),
};

/** Só para testes: esquece o estado em memória. */
export const resetCartForTests = () => {
  current = null;
};

/** O carrinho e o contador; no servidor (HTML pré-gerado) o carrinho é vazio. */
export function useCart() {
  const cart = useSyncExternalStore(subscribe, snapshot, () => EMPTY_CART);
  return { cart, count: cartCount(cart), ...cartActions };
}
