import type { CatalogItem } from "./catalog";

export type BannerRow = {
  image_path: string;
  title: string;
  subtitle: string;
  link: string | null;
  is_active: boolean;
  position: number;
};

/** `imagePath` é um caminho do bucket; no topo padrão, é null e a página usa a foto estática. */
export type Hero = { title: string; text: string; imagePath: string | null; link: string; isDefault: boolean };

export const DEFAULT_HERO: Hero = {
  title: "Troca de óleo e filtros com quem entende do assunto",
  text: "Óleos das principais marcas para carro, utilitário e linha pesada. Rápido, sem enrolação e com o registro da sua próxima troca.",
  imagePath: null,
  link: "/produtos",
  isDefault: true,
};

/** O banner ativo de menor ordem; sem nenhum, o topo padrão (painel-conteudo, Assumptions). */
export function activeBanner(banners: BannerRow[]): Hero {
  const b = banners.filter((x) => x.is_active).sort((x, y) => x.position - y.position)[0];
  if (!b) return DEFAULT_HERO;
  return { title: b.title, text: b.subtitle, imagePath: b.image_path, link: b.link || "/produtos", isDefault: false };
}

export type CouponRow = { code: string; percent: number; is_active: boolean; created_at: string };
export type Coupon = { code: string; percent: number };

/** O site mostra um cupom: o ativo mais antigo. */
export function activeCoupon(coupons: CouponRow[]): Coupon | null {
  const c = coupons.filter((x) => x.is_active).sort((x, y) => x.created_at.localeCompare(y.created_at))[0];
  return c ? { code: c.code, percent: c.percent } : null;
}

export const couponBadge = (c: Coupon) => `${c.percent}% OFF · ${c.code}`;
export const couponHeadline = (c: Coupon) => `${c.percent}% de desconto na sua troca`;
export const couponStoreNote = (c: Coupon) => `${c.percent}% de desconto na troca feita na loja.`;

export const FEATURED_LIMIT = 4;

export const featuredProducts = (items: CatalogItem[]) => items.filter((i) => i.isFeatured).slice(0, FEATURED_LIMIT);

/** "Rua X, 50, Bairro, Cidade": rua e número na primeira linha, bairro e cidade na segunda. */
export function splitAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const street = parts.slice(0, 2).join(", ");
  return { street, shortStreet: street.replace(/^Rua /, "R. "), area: parts.slice(2).join(", ") };
}
