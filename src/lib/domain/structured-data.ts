import { productTitle } from "./admin-products";
import { variantPrice } from "./catalog";
import { splitAddress } from "./home";
import type { ProductDetail } from "./product-page";
import { onlyDigits } from "./settings-input";
import type { SiteSettings } from "./site-settings";

const TIME = String.raw`(\d{1,2})(?:h(\d{2})?|:(\d{2}))?`;
const HOURS = new RegExp(String.raw`^\s*(?:das\s+)?${TIME}\s*(?:às|as|a|até|-|–)\s*${TIME}\s*$`, "i");

function time(h: string, m = "00"): string | null {
  return Number(h) <= 23 && Number(m) <= 59 ? `${h.padStart(2, "0")}:${m}` : null;
}

/** "7h às 18h", "8h30 às 12h", "7:00 às 18:00" e "das 7 às 18h" viram abrir e fechar; texto livre ou hora impossível dá null. */
export function parseHours(text: string): { opens: string; closes: string } | null {
  const m = HOURS.exec(text);
  if (!m) return null;
  const opens = time(m[1], m[2] ?? m[3]);
  const closes = time(m[4], m[5] ?? m[6]);
  return opens && closes && opens < closes ? { opens, closes } : null;
}

/** Telefone em E.164 do Brasil: tira o 55 quando o texto já traz o código do país. */
function brazilPhone(text: string) {
  const digits = onlyDigits(text);
  return `+55${digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits}`;
}

/** A cidade é o último trecho do endereço que não é CEP nem UF ("São Paulo - SP" vira "São Paulo"). */
function cityOf(area: string) {
  return area
    .split(",")
    .map((p) => p.trim().replace(/\s*[-/]\s*[A-Z]{2}$/, ""))
    .filter((p) => p && !/^(CEP\s*)?\d{5}-?\d{3}$/i.test(p) && !/^[A-Z]{2}$/.test(p))
    .at(-1);
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** JSON-LD da Home (SITEMAP-01 AC 4). */
export function localBusinessJsonLd(s: SiteSettings, siteUrl: string): Record<string, unknown> {
  const address = splitAddress(s.address);
  const city = cityOf(address.area);
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
    telephone: brazilPhone(s.phone),
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
