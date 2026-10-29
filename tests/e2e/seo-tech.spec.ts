import { expect, test } from "@playwright/test";
import { APP_URL } from "../../scripts/local-supabase/config.mjs";
import { seedSite } from "./support/site";
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
