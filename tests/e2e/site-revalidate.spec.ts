import { expect, test } from "@playwright/test";
import { REVALIDATE_SECRET } from "../../scripts/local-supabase/config.mjs";

test.describe("revalidação manual do site", () => {
  test("sem o segredo certo responde 401", async ({ request }) => {
    const none = await request.post("/api/revalidar");
    expect(none.status()).toBe(401);
    expect(await none.json()).toEqual({ revalidated: false });
    const wrong = await request.post("/api/revalidar", { headers: { authorization: "Bearer outro-segredo" } });
    expect(wrong.status()).toBe(401);
  });

  test("com o segredo revalida o site", async ({ request }) => {
    const res = await request.post("/api/revalidar", { headers: { authorization: `Bearer ${REVALIDATE_SECRET}` } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ revalidated: true });
  });
});
