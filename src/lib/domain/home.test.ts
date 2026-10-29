import { describe, expect, it } from "vitest";
import type { CatalogItem } from "./catalog";
import {
  activeBanner,
  activeCoupon,
  couponBadge,
  couponHeadline,
  couponStoreNote,
  DEFAULT_HERO,
  featuredProducts,
  splitAddress,
} from "./home";

const banner = (over: Partial<Parameters<typeof activeBanner>[0][number]> = {}) => ({
  image_path: "banners/a.webp",
  title: "Oferta da semana",
  subtitle: "Mobil Super com 10% off",
  link: "/produtos",
  is_active: true,
  position: 1,
  ...over,
});

describe("topo da Home", () => {
  it("mostra o banner ativo de menor ordem", () => {
    const hero = activeBanner([
      banner({ title: "Segundo", position: 2 }),
      banner({ title: "Inativo", position: 0, is_active: false }),
      banner({ title: "Primeiro", position: 1, image_path: "banners/p.webp", link: "https://x.com" }),
    ]);
    expect(hero).toEqual({
      title: "Primeiro",
      text: "Mobil Super com 10% off",
      imagePath: "banners/p.webp",
      link: "https://x.com",
      isDefault: false,
    });
  });

  it("sem banner ativo usa o topo padrão", () => {
    expect(activeBanner([banner({ is_active: false })])).toEqual(DEFAULT_HERO);
    expect(activeBanner([])).toEqual(DEFAULT_HERO);
    expect(DEFAULT_HERO.title).toBe("Troca de óleo e filtros com quem entende do assunto");
    expect(DEFAULT_HERO.isDefault).toBe(true);
  });
});

describe("cupom da Home", () => {
  const c = (code: string, is_active: boolean, created_at: string) => ({ code, percent: 10, is_active, created_at });

  it("usa o cupom ativo mais antigo e nenhum quando todos estão desligados", () => {
    expect(activeCoupon([c("NOVO", true, "2026-10-02"), c("FACLUB10", true, "2026-10-01"), c("OFF", false, "2026-09-01")])?.code).toBe("FACLUB10");
    expect(activeCoupon([c("FACLUB10", false, "2026-10-01")])).toBeNull();
    expect(activeCoupon([])).toBeNull();
  });

  it("monta o selo, o título do bloco e o texto da página do produto com o percentual", () => {
    const coupon = { code: "FACLUB10", percent: 10 };
    expect(couponBadge(coupon)).toBe("10% OFF · FACLUB10");
    expect(couponHeadline(coupon)).toBe("10% de desconto na sua troca");
    expect(couponStoreNote({ code: "TROCA15", percent: 15 })).toBe("15% de desconto na troca feita na loja.");
  });
});

describe("destaques e endereço", () => {
  const item = (id: string, isFeatured: boolean) => ({ id, isFeatured }) as CatalogItem;

  it("mostra até 4 produtos com destaque, na ordem recebida", () => {
    const items = ["a", "b", "c", "d", "e", "f"].map((id) => item(id, true));
    expect(featuredProducts([item("x", false), ...items]).map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
    expect(featuredProducts([item("x", false)])).toEqual([]);
  });

  it("separa rua e bairro do endereço das configurações", () => {
    expect(splitAddress("Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo")).toEqual({
      street: "Rua Cabo Antônio Alves, 50",
      shortStreet: "R. Cabo Antônio Alves, 50",
      area: "Parque Novo Mundo, São Paulo",
    });
    expect(splitAddress("Av. Brasil, 10")).toEqual({ street: "Av. Brasil, 10", shortStreet: "Av. Brasil, 10", area: "" });
  });
});
