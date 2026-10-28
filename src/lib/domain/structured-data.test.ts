import { describe, expect, it } from "vitest";
import { INITIAL_SETTINGS } from "./site-settings";
import { localBusinessJsonLd, parseHours, productJsonLd } from "./structured-data";
import type { ProductDetail } from "./product-page";

const SITE = "https://faclubrificantes.com.br";

const product: ProductDetail = {
  id: "top",
  slug: "top-turbo-15w-40",
  name: "Top Turbo 15W-40",
  brandName: "Lubrax",
  categorySlug: "linha-pesada",
  categoryName: "Linha pesada",
  sku: "LUB-TT-20",
  stock: 12,
  isPromo: true,
  isFeatured: true,
  description: "Para motores diesel.",
  specs: {},
  images: ["products/top/a.webp"],
  variants: [{ label: "Balde 20L", price: 389.9, promoPrice: 349.9 }],
};

describe("dados estruturados", () => {
  it("lê os horários das configurações e ignora texto livre", () => {
    expect(parseHours("7h às 18h")).toEqual({ opens: "07:00", closes: "18:00" });
    expect(parseHours("8h30 às 12h")).toEqual({ opens: "08:30", closes: "12:00" });
    expect(parseHours("8h - 13h")).toEqual({ opens: "08:00", closes: "13:00" });
    expect(parseHours("fechado")).toBeNull();
    expect(parseHours("")).toBeNull();
  });

  it("LocalBusiness com nome, endereço, telefone e horários das configurações", () => {
    expect(localBusinessJsonLd(INITIAL_SETTINGS, SITE)).toEqual({
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      name: "FAC LUB",
      url: SITE,
      image: `${SITE}/images/home/box-de-servico.jpg`,
      telephone: "+551129545764",
      email: "contato@faclubrificantes.com.br",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Cabo Antônio Alves, 50",
        addressLocality: "São Paulo",
        addressCountry: "BR",
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
      ],
    });
    // horário que não dá para ler fica de fora
    const json = localBusinessJsonLd({ ...INITIAL_SETTINGS, hoursSaturday: "fechado" }, SITE) as { openingHoursSpecification: unknown[] };
    expect(json.openingHoursSpecification).toHaveLength(1);
  });

  it("Product com marca, imagem, SKU e Offer em BRL; promocional só em oferta", () => {
    expect(productJsonLd(product, ["https://cdn/x.webp"], SITE)).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Lubrax Top Turbo 15W-40",
      description: "Para motores diesel.",
      brand: { "@type": "Brand", name: "Lubrax" },
      image: ["https://cdn/x.webp"],
      sku: "LUB-TT-20",
      offers: {
        "@type": "Offer",
        url: `${SITE}/produtos/top-turbo-15w-40`,
        price: "349.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    });
    const noPromo = productJsonLd({ ...product, isPromo: false }, [], SITE) as { offers: { price: string } };
    expect(noPromo.offers.price).toBe("389.90");
  });

  it("sem estoque é OutOfStock; sem SKU, imagem ou descrição os campos somem", () => {
    const json = productJsonLd({ ...product, stock: 0, sku: null, description: "" }, [], SITE) as Record<string, unknown>;
    expect((json.offers as { availability: string }).availability).toBe("https://schema.org/OutOfStock");
    expect(json).not.toHaveProperty("sku");
    expect(json).not.toHaveProperty("image");
    expect(json).not.toHaveProperty("description");
  });
});
