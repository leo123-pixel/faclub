import { describe, expect, it } from "vitest";
import { PRIVACY_UPDATED, sitemapEntries } from "./sitemap";

const SITE = "https://faclubrificantes.com.br";
const NOW = new Date("2026-10-28T12:00:00Z");

describe("sitemap", () => {
  it("lista Home, catálogo, política e cada produto com a data de alteração, em URLs absolutas", () => {
    const products = [
      { slug: "top-turbo-15w-40", updatedAt: "2026-10-20T10:00:00.000Z" },
      { slug: "filtro-de-ar", updatedAt: "2026-10-25T08:00:00.000Z" },
    ];
    expect(sitemapEntries(SITE, products, NOW)).toEqual([
      { url: `${SITE}/`, lastModified: "2026-10-25T08:00:00.000Z" },
      { url: `${SITE}/produtos`, lastModified: "2026-10-25T08:00:00.000Z" },
      { url: `${SITE}/politica-de-privacidade`, lastModified: PRIVACY_UPDATED },
      { url: `${SITE}/produtos/top-turbo-15w-40`, lastModified: "2026-10-20T10:00:00.000Z" },
      { url: `${SITE}/produtos/filtro-de-ar`, lastModified: "2026-10-25T08:00:00.000Z" },
    ]);
  });

  it("sem produtos, Home e catálogo valem a data de agora", () => {
    expect(sitemapEntries(SITE, [], NOW).map((e) => e.lastModified)).toEqual([NOW.toISOString(), NOW.toISOString(), PRIVACY_UPDATED]);
  });
});
