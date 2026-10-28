import type { NextConfig } from "next";

// cacheComponents fica desligado: o painel é dinâmico e o site usa ISR com
// revalidatePath (AD-012).
const nextConfig: NextConfig = {
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
