import { describe, expect, it } from "vitest";
import { formatBRL, parseBRL, toInputBRL } from "./money";

describe("valores em reais", () => {
  it("lê os formatos que a loja digita", () => {
    expect(parseBRL("39,90")).toBe(39.9);
    expect(parseBRL("1.234,56")).toBe(1234.56);
    expect(parseBRL("39.9")).toBe(39.9);
    expect(parseBRL("R$ 39,90")).toBe(39.9);
    expect(parseBRL("389")).toBe(389);
    expect(parseBRL("1.234")).toBe(1234);
    expect(parseBRL("12.345.678")).toBe(12345678);
    expect(parseBRL("1.234,5")).toBe(1234.5);
  });

  it("devolve null para texto, vazio, negativo e mais de 2 casas", () => {
    for (const v of ["abc", "", "   ", "-10", "-1,00", "12,345", "1,2,3", "1.2345"]) expect(parseBRL(v)).toBeNull();
  });

  it("formata com R$, milhar e duas casas", () => {
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
    expect(formatBRL(39.9)).toBe("R$ 39,90");
  });

  it("formata zero e valores redondos", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
    expect(formatBRL(389)).toBe("R$ 389,00");
  });

  it("preenche o campo de preço no formato que a loja digita", () => {
    expect(toInputBRL(389.9)).toBe("389,90");
    expect(toInputBRL(1234.5)).toBe("1234,50");
    expect(toInputBRL(null)).toBe("");
    expect(parseBRL(toInputBRL(49.9))).toBe(49.9);
  });
});
