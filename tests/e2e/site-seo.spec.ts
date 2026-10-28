import { expect, test, type Page } from "@playwright/test";
import { seedSite } from "./support/site";
import { serviceClient } from "./support/supabase";

const PAGES = ["/", "/produtos", "/produtos/top-turbo-15w-40", "/politica-de-privacidade"];

test.beforeEach(async () => {
  await seedSite();
});

async function tags(page: Page, path: string) {
  await page.goto(path);
  const meta = (selector: string) => page.locator(selector).first().getAttribute("content");
  return {
    title: await page.title(),
    description: await meta('meta[name="description"]'),
    ogTitle: await meta('meta[property="og:title"]'),
    ogDescription: await meta('meta[property="og:description"]'),
    ogImage: await meta('meta[property="og:image"]'),
    lang: await page.locator("html").getAttribute("lang"),
  };
}

test.describe("metatags", () => {
  test("SEO-01.1: Home, catálogo, produto e política têm título, descrição e Open Graph próprios", async ({ page }) => {
    const all = [];
    for (const path of PAGES) {
      const t = await tags(page, path);
      for (const value of [t.title, t.description, t.ogTitle, t.ogDescription, t.ogImage]) {
        expect(value, `${path}`).toBeTruthy();
      }
      expect(t.ogTitle).toBe(t.title);
      expect(t.ogDescription).toBe(t.description);
      expect(t.ogImage).toMatch(/^https?:\/\//);
      all.push(t);
    }
    for (const key of ["title", "description", "ogImage"] as const) {
      expect(new Set(all.map((t) => t[key])).size, key).toBe(PAGES.length);
    }
  });

  test("SEO-01.2: o produto usa <marca> <nome> | FAC LUB e a foto de capa como imagem Open Graph", async ({ page }) => {
    const { data } = await serviceClient()
      .from("product_images")
      .select("path, products!inner(slug)")
      .eq("products.slug", "top-turbo-15w-40")
      .eq("is_cover", true)
      .single();
    const t = await tags(page, "/produtos/top-turbo-15w-40");
    expect(t.title).toBe("Lubrax Top Turbo 15W-40 | FAC LUB");
    expect(t.ogTitle).toBe("Lubrax Top Turbo 15W-40 | FAC LUB");
    expect(t.ogImage).toBe(`http://127.0.0.1:54321/storage/v1/object/public/product-images/${data!.path}`);
    const res = await page.request.get(t.ogImage!);
    expect(res.headers()["content-type"]).toBe("image/webp");
  });

  test("SEO-01.3: <html lang=pt-BR> em todas as páginas", async ({ page }) => {
    for (const path of PAGES) {
      expect((await tags(page, path)).lang, path).toBe("pt-BR");
    }
  });
});
