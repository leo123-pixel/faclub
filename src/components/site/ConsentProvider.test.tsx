import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY } from "@/lib/domain/consent";
import { resetConsentForTests, useConsent } from "./ConsentProvider";

describe("escolha de cookies no navegador", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetConsentForTests();
  });
  afterEach(() => vi.restoreAllMocks());

  it("com o armazenamento bloqueado a escolha vale só na visita e o aviso volta na próxima", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    const first = renderHook(() => useConsent());
    expect(first.result.current.bannerOpen).toBe(true);
    act(() => first.result.current.accept());
    expect(first.result.current.consent).toEqual({ choice: "aceito" });
    expect(first.result.current.bannerOpen).toBe(false);
    // visita nova: nada foi guardado, o aviso volta e nada está aceito
    first.unmount();
    resetConsentForTests();
    const next = renderHook(() => useConsent());
    expect(next.result.current.bannerOpen).toBe(true);
    expect(next.result.current.consent).toEqual({ choice: null });
  });

  it("a escolha gravada é lida ao abrir e Preferências de cookies reabre o aviso", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ version: 1, choice: "recusado", at: new Date().toISOString() }));
    const { result } = renderHook(() => useConsent());
    expect(result.current.consent).toEqual({ choice: "recusado" });
    expect(result.current.bannerOpen).toBe(false);
    act(() => result.current.reopen());
    expect(result.current.bannerOpen).toBe(true);
    act(() => result.current.accept());
    expect(result.current.bannerOpen).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY)!).choice).toBe("aceito");
  });
});
