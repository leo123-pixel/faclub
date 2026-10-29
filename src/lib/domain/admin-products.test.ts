import { describe, expect, it } from "vitest";
import {
  adminKpis,
  displayVariant,
  filterAdminProducts,
  stockLabel,
  productTitle,
  type AdminProductRow,
} from "./admin-products";

function row(over: Partial<AdminProductRow> & { name: string }): AdminProductRow {
  return {
    id: over.name,
    brandName: "Lubrax",
    categoryId: "pesada",
    categoryName: "Linha pesada",
    sku: null,
    stock: 10,
    isVisible: true,
    isPromo: false,
    isFeatured: false,
    coverPath: null,
    variants: [{ label: "Balde 20L", price: 389.9, promoPrice: null }],
    ...over,
  };
}

const rows: AdminProductRow[] = [
  row({ name: "Super 5W-30 Sintético", brandName: "Mobil", categoryId: "leve", categoryName: "Linha leve", isPromo: true }),
  row({ name: "Top Turbo 15W-40", brandName: "Lubrax", sku: "LBX-1540-20", isPromo: true }),
  row({ name: "Rimula R4 15W-40", brandName: "Shell", stock: 5 }),
  row({ name: "Urania 15W-40", brandName: "Urania", stock: 3, isVisible: false }),
  row({ name: "Filtro de óleo", brandName: "Mobil", categoryId: "filtros", categoryName: "Filtros", isVisible: false }),
];

const names = (items: AdminProductRow[]) => items.map((r) => r.name);
const base = { tab: "todos" as const, query: "", categoryId: "", page: 1 };

describe("lista de produtos do painel", () => {
  it("PLIST-01.3: a aba Visíveis mostra só produtos visíveis", () => {
    const r = filterAdminProducts(rows, { ...base, tab: "visiveis" });
    expect(names(r.items)).toEqual(["Super 5W-30 Sintético", "Top Turbo 15W-40", "Rimula R4 15W-40"]);
  });

  it("PLIST-01.4: a aba Ocultos mostra só produtos ocultos", () => {
    const r = filterAdminProducts(rows, { ...base, tab: "ocultos" });
    expect(names(r.items)).toEqual(["Urania 15W-40", "Filtro de óleo"]);
  });

  it("PLIST-01.5: a busca acha por nome, marca e SKU sem caixa, acento ou hífen", () => {
    expect(names(filterAdminProducts(rows, { ...base, query: "filtro de oleo" }).items)).toEqual(["Filtro de óleo"]);
    expect(names(filterAdminProducts(rows, { ...base, query: "SHELL" }).items)).toEqual(["Rimula R4 15W-40"]);
    expect(names(filterAdminProducts(rows, { ...base, query: "lbx154020" }).items)).toEqual(["Top Turbo 15W-40"]);
    expect(names(filterAdminProducts(rows, { ...base, query: "15w40" }).items)).toEqual([
      "Top Turbo 15W-40",
      "Rimula R4 15W-40",
      "Urania 15W-40",
    ]);
    // categoria não entra na busca do painel
    expect(filterAdminProducts(rows, { ...base, query: "pesada" }).items).toEqual([]);
  });

  it("PLIST-01.6: o filtro de categoria combina com a aba e a busca", () => {
    const r = filterAdminProducts(rows, { ...base, tab: "visiveis", query: "15w40", categoryId: "pesada" });
    expect(names(r.items)).toEqual(["Top Turbo 15W-40", "Rimula R4 15W-40"]);
    expect(names(filterAdminProducts(rows, { ...base, categoryId: "filtros" }).items)).toEqual(["Filtro de óleo"]);
  });

  it("PLIST-01.7: estoque de 5 ou menos mostra Baixo · N; acima mostra N un.", () => {
    expect(stockLabel(5)).toEqual({ text: "Baixo · 5", low: true });
    expect(stockLabel(0)).toEqual({ text: "Baixo · 0", low: true });
    expect(stockLabel(6)).toEqual({ text: "6 un.", low: false });
  });

  it("PLIST-01.8: pagina de 20 em 20 com os textos de contagem", () => {
    const many = Array.from({ length: 45 }, (_, i) => row({ name: `Produto ${String(i + 1).padStart(2, "0")}` }));
    const p1 = filterAdminProducts(many, base);
    expect(p1.items).toHaveLength(20);
    expect(p1.label).toBe("20 de 45 produtos");
    expect(p1.pageLabel).toBe("Página 1 de 3");
    const p3 = filterAdminProducts(many, { ...base, page: 3 });
    expect(names(p3.items)).toEqual(["Produto 41", "Produto 42", "Produto 43", "Produto 44", "Produto 45"]);
    expect(p3.label).toBe("5 de 45 produtos");
    expect(p3.pageLabel).toBe("Página 3 de 3");
    expect(filterAdminProducts(many, { ...base, page: 9 }).page).toBe(3);
    const none = filterAdminProducts([], base);
    expect([none.label, none.pageLabel]).toEqual(["0 de 0 produtos", "Página 1 de 1"]);
  });

  it("PLIST-01.12: os cartões contam visíveis, em oferta visíveis, estoque baixo e pedidos de 30 dias", () => {
    expect(adminKpis(rows, 14)).toEqual({ active: 3, promo: 2, lowStock: 2, orders30: 14 });
    const hiddenPromo = [row({ name: "X", isVisible: false, isPromo: true, stock: 50 })];
    expect(adminKpis(hiddenPromo, 0)).toEqual({ active: 0, promo: 0, lowStock: 0, orders30: 0 });
  });

  it("PLIST-01.15: com várias embalagens mostra o preço da primeira e N embalagens", () => {
    const three = row({
      name: "Delvac",
      variants: [
        { label: "Frasco 1L", price: 49.9, promoPrice: 44.9 },
        { label: "Frasco 4L", price: 179.9, promoPrice: null },
        { label: "Balde 20L", price: 419.9, promoPrice: null },
      ],
    });
    expect(displayVariant(three)).toEqual({ label: "3 embalagens", price: 49.9, promoPrice: 44.9 });
    expect(displayVariant(rows[1])).toEqual({ label: "Balde 20L", price: 389.9, promoPrice: null });
  });

  it("PLIST-01.2: o título junta marca e nome sem repetir a marca", () => {
    expect(productTitle("Lubrax", "Top Turbo 15W-40")).toBe("Lubrax Top Turbo 15W-40");
    expect(productTitle("Urania", "Urania 15W-40")).toBe("Urania 15W-40");
    expect(productTitle("Brutus", "brutus 15W-40")).toBe("brutus 15W-40");
  });
});
