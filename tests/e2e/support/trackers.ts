import type { BrowserContext, Page } from "@playwright/test";
import { APP_URL } from "../../../scripts/local-supabase/config.mjs";

/** Estado de navegador com os cookies aceitos. */
export const cookiesAccepted = () => ({
  cookies: [],
  origins: [
    {
      origin: APP_URL,
      localStorage: [{ name: "faclub:cookies", value: JSON.stringify({ version: 1, choice: "aceito", at: new Date().toISOString() }) }],
    },
  ],
});

/** Google e Meta respondem um script vazio: as filas gtag e fbq ficam com os eventos. */
export async function stubTrackers(context: BrowserContext) {
  for (const host of ["https://www.googletagmanager.com/**", "https://connect.facebook.net/**"]) {
    await context.route(host, (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  }
}

type Sent = { ga4: [string, Record<string, unknown>][]; pixel: [string, Record<string, unknown>][] };

/** Eventos que chegaram às filas do GA4 (`gtag("event", ...)`) e do Pixel (`fbq("trackCustom", ...)`). */
export function sentEvents(page: Page): Promise<Sent> {
  return page.evaluate(() => {
    const ga4 = (window.dataLayer ?? [])
      .map((a) => Array.from(a as ArrayLike<unknown>))
      .filter((a) => a[0] === "event")
      .map((a) => [a[1], a[2]] as [string, Record<string, unknown>]);
    const pixel = ((window.fbq?.queue ?? []) as unknown[][])
      .filter((a) => a[0] === "trackCustom")
      .map((a) => [a[1], a[2]] as [string, Record<string, unknown>]);
    return { ga4, pixel };
  });
}
