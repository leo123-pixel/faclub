import { expect, test } from "@playwright/test";
import legacyUrls from "../../redirects/legacy-urls.json";

async function redirectOf(request: import("@playwright/test").APIRequestContext, path: string) {
  const res = await request.get(path, { maxRedirects: 0 });
  return { status: res.status(), location: res.headers()["location"] };
}

test.describe("URLs do site antigo", () => {
  test("REDIR-01.1: cada URL da lista, com e sem a barra final, responde 301 com o destino mapeado", async ({ request }) => {
    expect(legacyUrls.length).toBeGreaterThanOrEqual(12);
    for (const { from, to } of legacyUrls) {
      const bare = from.replace(/\/+$/, "");
      for (const path of [bare, `${bare}/`]) {
        expect(await redirectOf(request, path), path).toEqual({ status: 301, location: to });
      }
    }
  });

  test("REDIR-01.2: endereços sob /wp-content, /wp-admin e /feed respondem 301 para a Home", async ({ request }) => {
    for (const path of ["/wp-content/uploads/2019/logo.png", "/wp-admin/", "/wp-admin", "/feed/", "/feed"]) {
      expect(await redirectOf(request, path), path).toEqual({ status: 301, location: "/" });
    }
  });

  test("as outras páginas com barra final continuam indo para a forma sem barra", async ({ request }) => {
    for (const path of ["/produtos/", "/produtos/top-turbo-15w-40/", "/politica-de-privacidade/"]) {
      expect(await redirectOf(request, path), path).toEqual({ status: 308, location: path.slice(0, -1) });
    }
    expect((await request.get("/produtos", { maxRedirects: 0 })).status()).toBe(200);
  });
});
