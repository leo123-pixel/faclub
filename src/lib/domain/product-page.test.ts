import { describe, expect, it } from "vitest";
import type { CatalogItem } from "./catalog";
import { availability, chipOrder, packageCaption, relatedProducts, specRows, type ProductDetail } from "./product-page";

const detail = (over: Partial<ProductDetail> = {}): ProductDetail => ({
  id: "top",
  slug: "lubrax-top-turbo-15w-40",
  name: "Top Turbo 15W-40",
  brandName: "Lubrax",
  categorySlug: "linha-pesada",
  categoryName: "Linha pesada",
  description: "Lubrificante para motores diesel.",
  sku: "LUB-TT-20",
  specs: { viscosity: "15W-40", type: "Mineral", api: "CI-4", application: "Motores diesel" },
  stock: 12,
  isPromo: true,
  isFeatured: true,
  images: ["a.webp"],
  variants: [{ label: "Balde 20L", price: 389.9, promoPrice: 349.9 }],
  ...over,
});

describe("ficha técnica", () => {
  it("PDP-01.8: mostra as 6 linhas na ordem e esconde a de campo vazio", () => {
    expect(specRows(detail())).toEqual([
      { label: "Viscosidade", value: "15W-40" },
      { label: "Tipo", value: "Mineral" },
      { label: "Especificação API", value: "CI-4" },
      { label: "Aplicação", value: "Motores diesel" },
      { label: "Código", value: "LUB-TT-20" },
      { label: "Disponibilidade", value: "Pronta entrega" },
    ]);
    const semApiSemSku = specRows(detail({ sku: null, specs: { viscosity: "15W-40", type: "Mineral", api: " ", application: "Motores diesel" } }));
    expect(semApiSemSku.map((r) => r.label)).toEqual(["Viscosidade", "Tipo", "Aplicação", "Disponibilidade"]);
    const filtro = specRows(detail({ sku: "", specs: {} }));
    expect(filtro).toEqual([{ label: "Disponibilidade", value: "Pronta entrega" }]);
  });

  it("PDP-01.9: Pronta entrega com estoque acima de 0 e Sob consulta com 0", () => {
    expect(availability(1)).toBe("Pronta entrega");
    expect(availability(0)).toBe("Sob consulta");
    expect(specRows(detail({ stock: 0 })).at(-1)).toEqual({ label: "Disponibilidade", value: "Sob consulta" });
  });
});

describe("Combine com", () => {
  let n = 0;
  const item = (categorySlug: string, isFeatured = false, id = `i${++n}`) => ({ id, categorySlug, isFeatured }) as CatalogItem;

  it("PDP-01.12: até 4 de outras categorias, destaques primeiro, sem o próprio produto; nenhum esconde a seção", () => {
    const product = detail();
    const items = [
      item("linha-pesada", true, "mesma"),
      item("linha-pesada", false, "top"),
      item("filtros", false, "f1"),
      item("filtros", true, "f2"),
      item("aditivos-e-graxas", false, "g1"),
      item("linha-leve", false, "l1"),
      item("linha-leve", true, "l2"),
    ];
    expect(relatedProducts(product, items).map((i) => i.id)).toEqual(["f2", "l2", "f1", "g1"]);
    expect(relatedProducts(product, [item("linha-pesada", true), item("linha-pesada")])).toEqual([]);
  });
});

describe("embalagens", () => {
  it("a legenda do preço é 'à vista · <embalagem>' com a embalagem em minúscula", () => {
    expect(packageCaption("Balde 20L")).toBe("à vista · balde 20L");
    expect(packageCaption("Frasco 1L")).toBe("à vista · frasco 1L");
  });

  it("os chips seguem a ordem de tamanho e as embalagens livres vêm no fim", () => {
    const labels = ["Balde 20L", "Galão 5L", "Frasco 1L", "Frasco 4L"].map((label) => ({ label, price: 1, promoPrice: null }));
    expect(chipOrder(labels).map((v) => v.label)).toEqual(["Frasco 1L", "Frasco 4L", "Balde 20L", "Galão 5L"]);
  });
});
