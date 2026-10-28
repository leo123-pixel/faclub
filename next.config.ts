import type { NextConfig } from "next";

// cacheComponents fica desligado: o painel é dinâmico e o site usa ISR com
// revalidatePath (AD-012).
const nextConfig: NextConfig = {
  // O contato é uma seção da Home (site-publico, Assumptions).
  async redirects() {
    return [{ source: "/contato", destination: "/#contato", permanent: true }];
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
