import { describe, expect, it } from "vitest";
import {
  cardPrice,
  filterCatalog,
  productCountLabel,
  sortCatalog,
  toCatalogItem,
  type CatalogItem,
  type CatalogRow,
} from "./catalog";

let seq = 0;
function item(over: Partial<CatalogItem> = {}): CatalogItem {
  seq += 1;
  return {
    id: `p${seq}`,
    slug: `p${seq}`,
    name: `Produto ${seq}`,
    brandName: "Mobil",
    categorySlug: "linha-leve",
    categoryName: "Linha leve",
    sku: null,
    viscosity: "",
    application: "",
    isPromo: false,
    isFeatured: false,
    stock: 10,
    coverPath: null,
    variants: [{ label: "Frasco 1L", price: 50, promoPrice: null }],
    ...over,
  };
}

const ids = (items: CatalogItem[]) => items.map((i) => i.id);

const topTurbo = item({ id: "top", name: "Top Turbo 15W-40", brandName: "Lubrax", categorySlug: "linha-pesada", categoryName: "Linha pesada", viscosity: "15W-40", application: "Motores diesel" });
const rimula = item({ id: "rimula", name: "Rimula R4 X 15W-40", brandName: "Shell", categorySlug: "linha-pesada", categoryName: "Linha pesada", viscosity: "15W-40", application: "Motores diesel" });
const essencial = item({ id: "essencial", name: "Essencial 20W-50", brandName: "Lubrax", viscosity: "20W-50", application: "Motores a gasolina" });
const helix = item({ id: "helix", name: "Helix HX8 5W-30", brandName: "Shell", viscosity: "5W-30", application: "Óleo para carros flex" });
const helixUltra = item({ id: "ultra", name: "Helix Ultra 5W-40", brandName: "Shell", viscosity: "5W-40", application: "Carros a gasolina" });
const havoline = item({ id: "havoline", name: "Havoline 10W-40", brandName: "Texaco", viscosity: "10W-40", application: "Carros a gasolina" });
const filtro = item({ id: "filtro", name: "Filtro de óleo", brandName: "Tecfil", categorySlug: "filtros", categoryName: "Filtros", sku: "PSL-55", application: "Linha leve" });
const ALL = [topTurbo, rimula, essencial, helix, filtro];

describe("busca do catálogo", () => {
  it("CAT-01.5: 15w40, 15W-40, 15w 40 e 15W40 acham os mesmos produtos 15W-40", () => {
    for (const q of ["15w40", "15W-40", "15w 40", "15W40"]) {
      expect(ids(filterCatalog(ALL, { category: "", query: q }))).toEqual(["top", "rimula"]);
    }
    // viscosidades vizinhas não entram: 5W-40 e 10W-40 não são 15W-40, e 15W-40 não é 5W-40
    const neighbors = [...ALL, helixUltra, havoline];
    expect(ids(filterCatalog(neighbors, { category: "", query: "15w40" }))).toEqual(["top", "rimula"]);
    for (const q of ["5w40", "5W-40", "5w 40"]) {
      expect(ids(filterCatalog(neighbors, { category: "", query: q }))).toEqual(["ultra"]);
    }
    expect(ids(filterCatalog(neighbors, { category: "", query: "10w40" }))).toEqual(["havoline"]);
  });

  it("CAT-01.6: lubrax, LUBRAX e Lubrax acham os mesmos produtos da marca", () => {
    for (const q of ["lubrax", "LUBRAX", "Lubrax"]) {
      expect(ids(filterCatalog(ALL, { category: "", query: q }))).toEqual(["top", "essencial"]);
    }
  });

  it("CAT-01.7: oleo e óleo acham os mesmos produtos", () => {
    const sem = ids(filterCatalog(ALL, { category: "", query: "oleo" }));
    const com = ids(filterCatalog(ALL, { category: "", query: "óleo" }));
    expect(sem).toEqual(["helix", "filtro"]);
    expect(com).toEqual(sem);
  });

  it("CAT-01.8: várias palavras exigem todas, em qualquer ordem, entre nome, marca, categoria, viscosidade, aplicação e SKU", () => {
    expect(ids(filterCatalog(ALL, { category: "", query: "diesel 15w40" }))).toEqual(["top", "rimula"]);
    expect(ids(filterCatalog(ALL, { category: "", query: "15w40 diesel" }))).toEqual(["top", "rimula"]);
    expect(ids(filterCatalog(ALL, { category: "", query: "shell diesel" }))).toEqual(["rimula"]);
    expect(ids(filterCatalog(ALL, { category: "", query: "pesada lubrax" }))).toEqual(["top"]); // categoria + marca
    expect(ids(filterCatalog(ALL, { category: "", query: "psl55 filtros" }))).toEqual(["filtro"]); // SKU + categoria
    expect(ids(filterCatalog(ALL, { category: "", query: "lubrax gasolina" }))).toEqual(["essencial"]); // aplicação
    expect(filterCatalog(ALL, { category: "", query: "shell gasolina" })).toEqual([]);
  });
});

describe("ordem do catálogo", () => {
  const caro = item({ id: "caro", name: "Delvac 15W-40", categorySlug: "linha-pesada", viscosity: "15W-40", variants: [{ label: "Balde 20L", price: 420, promoPrice: null }] });
  const barato = item({ id: "barato", name: "Brutus 15W-40", categorySlug: "linha-pesada", viscosity: "15W-40", variants: [{ label: "Balde 20L", price: 300, promoPrice: null }] });
  // em oferta: vale o promocional (280); com oferta desligada, o promocional não conta (450)
  const oferta = item({ id: "oferta", name: "Rimula 15W-40", categorySlug: "linha-pesada", viscosity: "15W-40", isPromo: true, variants: [{ label: "Balde 20L", price: 400, promoPrice: 280 }] });
  const semOferta = item({ id: "semoferta", name: "Argina 15W-40", categorySlug: "linha-pesada", viscosity: "15W-40", isPromo: false, variants: [{ label: "Balde 20L", price: 450, promoPrice: 250 }] });
  const destaque = item({ id: "destaque", name: "Urania 15W-40", categorySlug: "linha-pesada", viscosity: "15W-40", isFeatured: true, variants: [{ label: "Balde 20L", price: 350, promoPrice: null }] });
  const leve = item({ id: "leve", name: "Aaa 15W-40", categorySlug: "linha-leve", viscosity: "15W-40", variants: [{ label: "Frasco 1L", price: 10, promoPrice: null }] });
  const outra = item({ id: "outra", name: "Abc 5W-30", categorySlug: "linha-pesada", viscosity: "5W-30", variants: [{ label: "Balde 20L", price: 100, promoPrice: null }] });
  const LIST = [caro, barato, oferta, semOferta, destaque, leve, outra];
  const pesada15 = (sort: Parameters<typeof sortCatalog>[1]) =>
    ids(sortCatalog(filterCatalog(LIST, { category: "linha-pesada", query: "15w40" }), sort));

  it("CAT-01.9: menor preço, maior preço, A–Z e destaques combinados com categoria e busca", () => {
    expect(pesada15("menor-preco")).toEqual(["oferta", "barato", "destaque", "caro", "semoferta"]);
    expect(pesada15("maior-preco")).toEqual(["semoferta", "caro", "destaque", "barato", "oferta"]);
    // A–Z pelo título "Marca Nome": Mobil Argina, Mobil Brutus, Mobil Delvac, Mobil Rimula, Mobil Urania
    expect(pesada15("a-z")).toEqual(["semoferta", "barato", "caro", "oferta", "destaque"]);
    // destaques primeiro, depois ofertas, depois A–Z
    expect(pesada15("destaques")).toEqual(["destaque", "oferta", "semoferta", "barato", "caro"]);
  });

  it("CAT-01.9: a ordem por preço usa o preço da primeira embalagem, o mesmo do card", () => {
    // o balde vem primeiro no cadastro; o frasco é mais barato, mas não é o preço do card
    const balde = item({ id: "balde", name: "Aaa Balde", variants: [{ label: "Balde 20L", price: 300, promoPrice: null }, { label: "Frasco 1L", price: 20, promoPrice: null }] });
    const frasco = item({ id: "frasco", name: "Bbb Frasco", variants: [{ label: "Frasco 1L", price: 40, promoPrice: null }, { label: "Balde 20L", price: 500, promoPrice: null }] });
    const meio = item({ id: "meio", name: "Ccc Meio", variants: [{ label: "Frasco 4L", price: 100, promoPrice: null }] });
    expect(ids(sortCatalog([balde, frasco, meio], "menor-preco"))).toEqual(["frasco", "meio", "balde"]);
    expect(ids(sortCatalog([balde, frasco, meio], "maior-preco"))).toEqual(["balde", "meio", "frasco"]);
  });

  it("CAT-01.9: a ordem não altera a lista recebida", () => {
    const list = [caro, barato];
    sortCatalog(list, "menor-preco");
    expect(ids(list)).toEqual(["caro", "barato"]);
  });

  it("filtro por categoria sozinho e categoria vazia mostrando todas", () => {
    expect(ids(filterCatalog(ALL, { category: "filtros", query: "" }))).toEqual(["filtro"]);
    expect(filterCatalog(ALL, { category: "", query: "" })).toHaveLength(5);
  });
});

describe("contador e preço do card", () => {
  it("CAT-01.10: N produtos, com 1 produto no singular", () => {
    expect(productCountLabel(0)).toBe("0 produtos");
    expect(productCountLabel(1)).toBe("1 produto");
    expect(productCountLabel(2)).toBe("2 produtos");
    expect(productCountLabel(12)).toBe("12 produtos");
  });

  it("o card usa a primeira embalagem e só mostra o promocional com a oferta ligada", () => {
    const variants = [
      { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
      { label: "Frasco 1L", price: 39.9, promoPrice: null },
    ];
    expect(cardPrice(item({ isPromo: true, variants }))).toEqual({ label: "Balde 20L", price: 349.9, regular: 389.9 });
    expect(cardPrice(item({ isPromo: false, variants }))).toEqual({ label: "Balde 20L", price: 389.9, regular: null });
  });

  it("monta o item a partir da linha do Supabase, com embalagens na ordem e capa", () => {
    const row: CatalogRow = {
      id: "x",
      slug: "top-turbo",
      name: "Top Turbo 15W-40",
      sku: "LUB-1",
      stock: 3,
      is_promo: true,
      is_featured: false,
      specs: { viscosity: "15W-40", application: "Motores diesel" },
      brand: { name: "Lubrax" },
      category: { slug: "linha-pesada", name: "Linha pesada" },
      variants: [
        { label: "Frasco 1L", price: "39.90", promo_price: null, position: 2 },
        { label: "Balde 20L", price: "389.90", promo_price: "349.90", position: 1 },
      ],
      images: [
        { path: "a.webp", is_cover: false, position: 0 },
        { path: "b.webp", is_cover: true, position: 1 },
      ],
    };
    expect(toCatalogItem(row)).toEqual({
      id: "x",
      slug: "top-turbo",
      name: "Top Turbo 15W-40",
      brandName: "Lubrax",
      categorySlug: "linha-pesada",
      categoryName: "Linha pesada",
      sku: "LUB-1",
      viscosity: "15W-40",
      application: "Motores diesel",
      isPromo: true,
      isFeatured: false,
      stock: 3,
      coverPath: "b.webp",
      variants: [
        { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
        { label: "Frasco 1L", price: 39.9, promoPrice: null },
      ],
    });
  });
});
