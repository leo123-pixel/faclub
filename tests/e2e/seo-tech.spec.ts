import { expect, test, type Page } from "@playwright/test";
import { APP_URL } from "../../scripts/local-supabase/config.mjs";
import { refreshSite, seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

test.beforeEach(async () => {
  await seedSite();
});

async function sitemapUrls(request: import("@playwright/test").APIRequestContext) {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  return [...xml.matchAll(/<url>[^]*?<loc>([^<]+)<\/loc>[^]*?<lastmod>([^<]+)<\/lastmod>[^]*?<\/url>/g)].map((m) => ({
    loc: m[1],
    lastmod: m[2],
  }));
}

test.describe("sitemap e robots", () => {
  test("SITEMAP-01.1: o sitemap lista Home, catálogo, política e os 12 produtos visíveis com a data de alteração", async ({ request }) => {
    const { data, error } = await serviceClient().from("products").select("slug, updated_at").eq("is_visible", true);
    if (error) throw error;
    expect(data).toHaveLength(12);
    const urls = await sitemapUrls(request);
    const locs = urls.map((u) => u.loc);
    for (const path of ["/", "/produtos", "/politica-de-privacidade"]) {
      expect(locs, path).toContain(`${APP_URL}${path}`);
    }
    for (const p of data) {
      const entry = urls.find((u) => u.loc === `${APP_URL}/produtos/${p.slug}`);
      expect(entry, p.slug).toBeTruthy();
      expect(entry!.lastmod, p.slug).toBe(new Date(p.updated_at).toISOString());
    }
    expect(urls).toHaveLength(3 + 12);
  });

  test("SITEMAP-01.2: o produto oculto e o painel ficam fora do sitemap", async ({ request }) => {
    const { data: hidden } = await serviceClient().from("products").select("slug").eq("is_visible", false);
    expect(hidden?.map((p) => p.slug)).toEqual(["helix-ultra-5w-40"]);
    const locs = (await sitemapUrls(request)).map((u) => u.loc);
    expect(locs.some((l) => l.includes("helix-ultra-5w-40"))).toBe(false);
    expect(locs.some((l) => l.includes("/admin"))).toBe(false);
    expect(locs.some((l) => l.includes("/carrinho"))).toBe(false);
  });

  test("SITEMAP-01.3: o robots libera o site, bloqueia painel e carrinho e aponta o sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const lines = (await res.text()).split("\n").map((l) => l.trim());
    expect(lines).toContain("User-Agent: *");
    expect(lines).toContain("Allow: /");
    expect(lines).toContain("Disallow: /admin");
    expect(lines).toContain("Disallow: /carrinho");
    expect(lines).toContain(`Sitemap: ${APP_URL}/sitemap.xml`);
  });
});

async function jsonLd(page: Page, path: string) {
  await page.goto(path);
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(scripts, path).toHaveLength(1);
  return JSON.parse(scripts[0]);
}

test.describe("dados estruturados", () => {
  test("SITEMAP-01.4: a Home tem AutoRepair com os dados das configurações e acompanha o telefone", async ({ page }) => {
    const ld = await jsonLd(page, "/");
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      name: "FAC LUB",
      url: APP_URL,
      telephone: "+551129545764",
      email: "contato@faclubrificantes.com.br",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Cabo Antônio Alves, 50",
        addressLocality: "São Paulo",
        addressCountry: "BR",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:00",
          closes: "18:00",
        },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
      ],
    });

    const { error } = await serviceClient().from("settings").update({ phone: "(11) 3333-4444" }).eq("id", 1);
    if (error) throw error;
    await refreshSite();
    expect((await jsonLd(page, "/")).telephone).toBe("+551133334444");
  });

  test("SITEMAP-01.5: o Top Turbo tem Product com marca, imagem, SKU e oferta em reais; sem estoque, OutOfStock", async ({ page }) => {
    const ld = await jsonLd(page, "/produtos/top-turbo-15w-40");
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Lubrax Top Turbo 15W-40",
      brand: { "@type": "Brand", name: "Lubrax" },
      sku: "LUB-TT-20",
      offers: {
        "@type": "Offer",
        url: `${APP_URL}/produtos/top-turbo-15w-40`,
        price: "349.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    });
    expect(ld.image).toHaveLength(4);

    // sem estoque, a oferta diz OutOfStock
    const { error } = await serviceClient().from("products").update({ stock: 0 }).eq("slug", "rimula-r4-15w-40");
    if (error) throw error;
    await refreshSite();
    const out = await jsonLd(page, "/produtos/rimula-r4-15w-40");
    expect(out.offers).toMatchObject({ price: "459.90", priceCurrency: "BRL", availability: "https://schema.org/OutOfStock" });
    for (const url of ld.image) {
      const res = await page.request.get(url);
      expect(res.status(), url).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/webp");
    }
  });
});
