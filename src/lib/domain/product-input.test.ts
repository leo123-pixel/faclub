import { describe, expect, it } from "vitest";
import { emptyProduct, validateProduct, type ProductFormValues } from "./product-input";

const REQUIRED = "Campo obrigatório";

function complete(): ProductFormValues {
  return {
    ...emptyProduct("8f0c4c8e-5d1e-4b8e-9f43-3d2b7b1c0a11"),
    name: "Top Turbo 15W-40",
    brandId: "b1",
    categoryId: "c1",
    description: "Para motores diesel",
    sku: "LBX-1540-20",
    stock: "12",
    variants: [{ label: "Balde 20L", price: "389,90", promoPrice: "349,90" }],
    images: [{ path: "products/x/a.webp", isCover: true }],
    specs: { viscosity: "15W-40", type: "Mineral", api: "CI-4", application: "Motores diesel" },
    isVisible: true,
    isPromo: true,
  };
}

describe("validação do produto", () => {
  it("exige o nome", () => {
    const r = validateProduct({ ...complete(), name: "   " });
    expect(r).toEqual({ ok: false, errors: { name: REQUIRED } });
  });

  it("exige marca e categoria", () => {
    const r = validateProduct({ ...complete(), brandId: "", categoryId: "" });
    expect(r).toEqual({ ok: false, errors: { brandId: REQUIRED, categoryId: REQUIRED } });
  });

  it("exige ao menos uma embalagem com preço", () => {
    expect(validateProduct({ ...complete(), variants: [] })).toEqual({ ok: false, errors: { variants: REQUIRED } });
    expect(
      validateProduct({ ...complete(), variants: [{ label: "Balde 20L", price: "", promoPrice: "" }] }),
    ).toEqual({ ok: false, errors: { "variants.0.price": REQUIRED } });
  });

  it("exige ao menos uma foto", () => {
    expect(validateProduct({ ...complete(), images: [] })).toEqual({ ok: false, errors: { images: REQUIRED } });
  });

  it("recusa preço promocional igual ou maior que o preço", () => {
    const msg = "O preço promocional precisa ser menor que o preço.";
    for (const promo of ["389,90", "400"]) {
      const r = validateProduct({ ...complete(), variants: [{ label: "Balde 20L", price: "389,90", promoPrice: promo }] });
      expect(r).toEqual({ ok: false, errors: { "variants.0.promoPrice": msg } });
    }
  });

  it("recusa preço que não é número", () => {
    const msg = "Informe um número válido.";
    const r = validateProduct({ ...complete(), variants: [{ label: "Balde 20L", price: "abc", promoPrice: "-5" }] });
    expect(r).toEqual({ ok: false, errors: { "variants.0.price": msg, "variants.0.promoPrice": msg } });
  });

  it("recusa estoque negativo ou quebrado", () => {
    const msg = "Informe um número válido.";
    expect(validateProduct({ ...complete(), stock: "-1" })).toEqual({ ok: false, errors: { stock: msg } });
    expect(validateProduct({ ...complete(), stock: "2,5" })).toEqual({ ok: false, errors: { stock: msg } });
  });

  it("aceita o produto completo e monta o payload de save_product", () => {
    const r = validateProduct(complete());
    expect(r).toEqual({
      ok: true,
      payload: {
        id: "8f0c4c8e-5d1e-4b8e-9f43-3d2b7b1c0a11",
        name: "Top Turbo 15W-40",
        brand_id: "b1",
        category_id: "c1",
        description: "Para motores diesel",
        sku: "LBX-1540-20",
        stock: 12,
        specs: { viscosity: "15W-40", type: "Mineral", api: "CI-4", application: "Motores diesel" },
        is_visible: true,
        is_promo: true,
        is_featured: false,
        variants: [{ label: "Balde 20L", price: 389.9, promo_price: 349.9 }],
        images: [{ path: "products/x/a.webp", is_cover: true }],
      },
    });
  });
});
