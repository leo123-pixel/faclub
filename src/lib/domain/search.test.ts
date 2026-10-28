import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeSearch } from "./search";

const topTurbo = ["Top Turbo 15W-40", "Lubrax", "Linha pesada", "LBX-1540-20"];

describe("busca tolerante", () => {
  it("acha 15W-40 por 15w40, 15W-40 e 15W40", () => {
    for (const q of ["15w40", "15W-40", "15W40"]) expect(matchesSearch(topTurbo, q)).toBe(true);
    expect(matchesSearch(topTurbo, "10w40")).toBe(false);
  });

  it("acha a marca sem diferenciar maiúsculas", () => {
    for (const q of ["lubrax", "LUBRAX", "Lubrax"]) expect(matchesSearch(topTurbo, q)).toBe(true);
  });

  it("acha óleo por oleo e por óleo", () => {
    const fluido = ["Óleo de câmbio 75W-90"];
    expect(matchesSearch(fluido, "oleo")).toBe(true);
    expect(matchesSearch(fluido, "óleo")).toBe(true);
    expect(matchesSearch(fluido, "cambio")).toBe(true);
  });

  it("exige todas as palavras da busca, em qualquer ordem", () => {
    expect(matchesSearch(topTurbo, "15w40 lubrax")).toBe(true);
    expect(matchesSearch(topTurbo, "lubrax shell")).toBe(false);
  });

  it("busca vazia aceita tudo", () => {
    expect(matchesSearch(topTurbo, "")).toBe(true);
    expect(matchesSearch(topTurbo, "   ")).toBe(true);
  });

  it("acha o SKU sem os hífens", () => {
    expect(matchesSearch(topTurbo, "lbx154020")).toBe(true);
    expect(normalizeSearch("LBX-1540-20")).toBe("lbx154020");
  });
});
