import { describe, expect, it } from "vitest";
import { validateBanner, type BannerValues } from "./banner-input";

const LINK = "Use um link do site (começando com /) ou um endereço completo.";

function values(over: Partial<BannerValues> = {}): BannerValues {
  return {
    id: "b1",
    imagePath: "banners/b1.webp",
    title: "Oferta da semana",
    subtitle: "Troca com 10% no FACLUB10",
    link: "/produtos",
    position: "1",
    isActive: true,
    ...over,
  };
}

describe("banner", () => {
  it("BAN-01.3: cada campo que falta mostra Campo obrigatório, sozinho ou junto", () => {
    expect(validateBanner(values({ imagePath: "", title: "  " }))).toEqual({
      ok: false,
      errors: { imagePath: "Campo obrigatório", title: "Campo obrigatório" },
    });
    expect(validateBanner(values({ title: "" }))).toEqual({ ok: false, errors: { title: "Campo obrigatório" } });
    expect(validateBanner(values({ imagePath: "" }))).toEqual({ ok: false, errors: { imagePath: "Campo obrigatório" } });
  });

  it("BAN-01.4: link fora de /, https:// e http:// é recusado", () => {
    for (const link of ["www.site.com", "ftp://x.com", "javascript:alert(1)", "//outro.com", "https://", "produtos"]) {
      expect(validateBanner(values({ link }))).toEqual({ ok: false, errors: { link: LINK } });
    }
    for (const link of ["/produtos", "/produtos?categoria=linha-pesada", "/produtos?busca=oleo 5w30", "https://x.com", "http://x.com/a", ""]) {
      expect(validateBanner(values({ link })).ok).toBe(true);
    }
  });

  it("a ordem precisa ser um inteiro não negativo", () => {
    for (const position of ["-1", "2,5", "um"]) {
      expect(validateBanner(values({ position }))).toEqual({ ok: false, errors: { position: "Informe um número válido." } });
    }
  });

  it("aceita o banner completo e monta o payload", () => {
    expect(validateBanner(values({ link: "", position: "" }))).toEqual({
      ok: true,
      payload: {
        id: "b1",
        image_path: "banners/b1.webp",
        title: "Oferta da semana",
        subtitle: "Troca com 10% no FACLUB10",
        link: null,
        position: 0,
        is_active: true,
      },
    });
  });
});
