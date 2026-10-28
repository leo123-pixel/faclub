import { describe, expect, it } from "vitest";
import { formatBRL, parseBRL } from "./money";

describe("valores em reais", () => {
  it("lê os formatos que a loja digita", () => {
    expect(parseBRL("39,90")).toBe(39.9);
    expect(parseBRL("1.234,56")).toBe(1234.56);
    expect(parseBRL("39.9")).toBe(39.9);
    expect(parseBRL("R$ 39,90")).toBe(39.9);
    expect(parseBRL("389")).toBe(389);
  });

  it("devolve null para texto, vazio, negativo e mais de 2 casas", () => {
    for (const v of ["abc", "", "   ", "-10", "-1,00", "12,345", "1,2,3"]) expect(parseBRL(v)).toBeNull();
  });

  it("formata com R$, milhar e duas casas", () => {
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
    expect(formatBRL(39.9)).toBe("R$ 39,90");
  });

  it("formata zero e valores redondos", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
    expect(formatBRL(389)).toBe("R$ 389,00");
  });
});
