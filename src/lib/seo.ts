import type { Metadata } from "next";

/**
 * Título, descrição e Open Graph próprios de uma página pública (SEO-01).
 * O Next junta o `openGraph` das camadas sem mesclar campos, então cada página monta o seu.
 */
export function pageMetadata({ title, description, image, path }: { title: string; description: string; image: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "FAC LUB",
      locale: "pt_BR",
      type: "website",
      images: [{ url: image }],
    },
  };
}
