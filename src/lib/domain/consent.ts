/** Escolha de cookies (CONS-01): vale 180 dias; sem escolha válida, o aviso aparece. */
export type ConsentChoice = "aceito" | "recusado";
export type Consent = { choice: ConsentChoice | null };

export const CONSENT_DAYS = 180;
export const CONSENT_STORAGE_KEY = "faclub:cookies";
export const NO_CHOICE: Consent = { choice: null };

const DAY = 24 * 60 * 60 * 1000;

export function readConsent(raw: string | null, now: Date): Consent {
  if (!raw) return NO_CHOICE;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || (data.choice !== "aceito" && data.choice !== "recusado")) return NO_CHOICE;
    const at = Date.parse(data.at);
    const age = now.getTime() - at;
    // data no futuro (relógio adiantado ou texto mexido) não pode esticar os 180 dias
    if (Number.isNaN(at) || age > CONSENT_DAYS * DAY || age < -DAY) return NO_CHOICE;
    return { choice: data.choice };
  } catch {
    return NO_CHOICE;
  }
}

export const writeConsent = (choice: ConsentChoice, now: Date) => JSON.stringify({ version: 1, choice, at: now.toISOString() });

/** GA4 e Pixel só com aceite (CONS-01 AC 2). */
export const canTrack = (consent: Consent) => consent.choice === "aceito";

/** Cookies que o GA4 e o Pixel gravam; saem quando o visitante recusa depois de aceitar (CONS-02). */
export const isTrackerCookie = (name: string) => /^(_ga(_.+)?|_gid|_gat(_.+)?|_gcl_.+|_fbp|_fbc)$/.test(name);
