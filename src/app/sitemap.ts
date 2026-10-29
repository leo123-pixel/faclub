import type { MetadataRoute } from "next";
import { loadSitemapProducts } from "@/lib/data/public";
import { sitemapEntries } from "@/lib/domain/sitemap";
import { siteUrl } from "@/lib/seo";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries(siteUrl(), await loadSitemapProducts(), new Date());
}
