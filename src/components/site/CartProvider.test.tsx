import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CART_STORAGE_KEY } from "@/lib/domain/cart";
import { resetCartForTests, useCart } from "./CartProvider";

const line = { productId: "p1", slug: "top-turbo-15w-40", title: "Lubrax Top Turbo 15W-40", label: "Balde 20L", qty: 2 };

describe("carrinho no navegador", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCartForTests();
  });
  afterEach(() => vi.restoreAllMocks());

  it("CART-01.10: com o armazenamento bloqueado o carrinho funciona durante a visita", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    const { result } = renderHook(() => useCart());
    expect(result.current.count).toBe(0);
    act(() => result.current.add(line));
    act(() => result.current.add({ ...line, qty: 1 }));
    expect(result.current.count).toBe(3);
    expect(result.current.cart.lines).toEqual([{ ...line, qty: 3 }]);
    // outro componente na mesma visita vê o mesmo carrinho
    const other = renderHook(() => useCart());
    expect(other.result.current.count).toBe(3);
  });

  it("lê o carrinho guardado ao abrir e regrava cada alteração com a data", () => {
    const saved = { version: 1, updatedAt: new Date().toISOString(), lines: [line] };
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useCart());
    expect(result.current.count).toBe(2);
    const before = Date.now();
    act(() => result.current.setQty("p1", "Balde 20L", 5));
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored.lines).toEqual([{ ...line, qty: 5 }]);
    expect(Date.parse(stored.updatedAt)).toBeGreaterThanOrEqual(before);
    act(() => result.current.remove("p1", "Balde 20L"));
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    expect(result.current.count).toBe(0);
  });
});
