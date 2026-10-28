import { productTitle } from "./admin-products";
import { variantPrice } from "./catalog";
import { splitAddress } from "./home";
import type { ProductDetail } from "./product-page";
import { onlyDigits } from "./settings-input";
import type { SiteSettings } from "./site-settings";

const pad = (h: string, m?: string) => `${h.padStart(2, "0")}:${m ?? "00"}`;

/** "7h às 18h" e "8h30 às 12h" viram horário de abrir e fechar; texto livre dá null. */
export function parseHours(text: string): { opens: string; closes: string } | null {
  const m = /^\s*(\d{1,2})h(\d{2})?\s*(?:às|as|a|-|–)\s*(\d{1,2})h(\d{2})?\s*$/i.exec(text);
  return m ? { opens: pad(m[1], m[2]), closes: pad(m[3], m[4]) } : null;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** JSON-LD da Home (SITEMAP-01 AC 4). */
export function localBusinessJsonLd(s: SiteSettings, siteUrl: string): Record<string, unknown> {
  const address = splitAddress(s.address);
  const city = address.area.split(",").map((p) => p.trim()).filter(Boolean).at(-1);
  const hours = [
    { dayOfWeek: WEEKDAYS as string[] | string, time: parseHours(s.hoursWeekdays) },
    { dayOfWeek: "Saturday", time: parseHours(s.hoursSaturday) },
  ].flatMap((h) => (h.time ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: h.dayOfWeek, ...h.time }] : []));
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "FAC LUB",
    url: siteUrl,
    image: `${siteUrl}/images/home/box-de-servico.jpg`,
    telephone: `+55${onlyDigits(s.phone)}`,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      ...(city ? { addressLocality: city } : {}),
      addressCountry: "BR",
    },
    openingHoursSpecification: hours,
  };
}

/** JSON-LD da página do produto (SITEMAP-01 AC 5); `imageUrls` já são endereços completos. */
export function productJsonLd(p: ProductDetail, imageUrls: string[], siteUrl: string): Record<string, unknown> {
  const first = p.variants[0];
  const price = first ? variantPrice(p.isPromo, first).price : 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle(p.brandName, p.name),
    ...(p.description ? { description: p.description } : {}),
    brand: { "@type": "Brand", name: p.brandName },
    ...(imageUrls.length ? { image: imageUrls } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/produtos/${p.slug}`,
      price: price.toFixed(2),
      priceCurrency: "BRL",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
