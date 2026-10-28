/** Data do texto da política de privacidade ("Atualizada em 28 de outubro de 2026"). */
export const PRIVACY_UPDATED = "2026-10-28T00:00:00.000Z";

export type SitemapEntry = { url: string; lastModified: string };

/**
 * Home, catálogo, política e cada produto visível (SITEMAP-01 AC 1 e 2). Home
 * e catálogo mudam quando muda um produto; sem produtos, valem `now`.
 */
export function sitemapEntries(siteUrl: string, products: { slug: string; updatedAt: string }[], now: Date): SitemapEntry[] {
  const latest = products.map((p) => p.updatedAt).sort().at(-1) ?? now.toISOString();
  return [
    { url: `${siteUrl}/`, lastModified: latest },
    { url: `${siteUrl}/produtos`, lastModified: latest },
    { url: `${siteUrl}/politica-de-privacidade`, lastModified: PRIVACY_UPDATED },
    ...products.map((p) => ({ url: `${siteUrl}/produtos/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
