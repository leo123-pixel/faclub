import type { NextConfig } from "next";
import legacyUrls from "./redirects/legacy-urls.json";
import { buildRedirects } from "./src/lib/domain/legacy-redirects";

// cacheComponents fica desligado: o painel é dinâmico e o site usa ISR com
// revalidatePath (AD-012).
const nextConfig: NextConfig = {
  // O Next tiraria a barra final com 308 antes das regras abaixo, e `/contato/`
  // do WordPress não chegaria ao 301; a mesma regra fica no fim da lista.
  skipTrailingSlashRedirect: true,
  // URLs do site antigo em 301 (REDIR-01); `/contato` vai para a seção da Home.
  async redirects() {
    return [...buildRedirects(legacyUrls), { source: "/:path+/", destination: "/:path+", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
