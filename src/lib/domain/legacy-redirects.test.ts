import { describe, expect, it } from "vitest";
import legacy from "../../../redirects/legacy-urls.json";
import { buildRedirects, checkLegacyList, WORDPRESS_RULES } from "./legacy-redirects";

describe("URLs do site antigo", () => {
  it("REDIR-01.3: cada par do arquivo é válido e vira 301 com e sem a barra final", () => {
    expect(legacy).toHaveLength(12);
    expect(checkLegacyList(legacy)).toEqual([]);
    const redirects = buildRedirects(legacy);
    for (const { from, to } of legacy) {
      const bare = from.replace(/\/$/, "");
      expect(redirects).toContainEqual({ source: bare, destination: to, statusCode: 301 });
      expect(redirects).toContainEqual({ source: `${bare}/`, destination: to, statusCode: 301 });
    }
    // as páginas com equivalente no site novo vão para a seção certa
    expect(redirects).toContainEqual({ source: "/contato/", destination: "/#contato", statusCode: 301 });
    expect(redirects).toContainEqual({ source: "/servicos/", destination: "/#servicos", statusCode: 301 });
  });

  it("as regras gerais levam wp-content, wp-admin e feed para a Home", () => {
    expect(WORDPRESS_RULES).toEqual([
      { source: "/wp-content", destination: "/", statusCode: 301 },
      { source: "/wp-content/:path*", destination: "/", statusCode: 301 },
      { source: "/wp-admin", destination: "/", statusCode: 301 },
      { source: "/wp-admin/:path*", destination: "/", statusCode: 301 },
      { source: "/feed", destination: "/", statusCode: 301 },
      { source: "/feed/:path*", destination: "/", statusCode: 301 },
    ]);
    expect(buildRedirects([])).toEqual(WORDPRESS_RULES);
  });

  it("a lista recusa caminho inseguro, destino externo, a Home e repetição", () => {
    expect(checkLegacyList([{ from: "/a/:id", to: "/" }])).toEqual(["caminho antigo inválido: /a/:id"]);
    expect(checkLegacyList([{ from: "/a/", to: "https://outro.com" }])).toEqual(["destino fora do site: https://outro.com"]);
    expect(checkLegacyList([{ from: "/a/", to: "//outro.com" }])).toEqual(["destino fora do site: //outro.com"]);
    expect(checkLegacyList([{ from: "/", to: "/" }])).toEqual(["caminho antigo inválido: /"]);
    expect(checkLegacyList([{ from: "/a/", to: "/" }, { from: "/a", to: "/" }])).toEqual(["caminho repetido: /a"]);
    expect(() => buildRedirects([{ from: "/a/:id", to: "/" }])).toThrow(/legacy-urls/);
  });
});
