/** Escolha de cookies (CONS-01): vale 180 dias; sem escolha válida, o aviso aparece. */
export type ConsentChoice = "aceito" | "recusado";
export type Consent = { choice: ConsentChoice | null };

export const CONSENT_DAYS = 180;
export const CONSENT_STORAGE_KEY = "faclub:cookies";
export const NO_CHOICE: Consent = { choice: null };

export function readConsent(raw: string | null, now: Date): Consent {
  if (!raw) return NO_CHOICE;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || (data.choice !== "aceito" && data.choice !== "recusado")) return NO_CHOICE;
    const at = Date.parse(data.at);
    if (Number.isNaN(at) || now.getTime() - at > CONSENT_DAYS * 24 * 60 * 60 * 1000) return NO_CHOICE;
    return { choice: data.choice };
  } catch {
    return NO_CHOICE;
  }
}

export const writeConsent = (choice: ConsentChoice, now: Date) => JSON.stringify({ version: 1, choice, at: now.toISOString() });

/** GA4 e Pixel só com aceite (CONS-01 AC 2). */
export const canTrack = (consent: Consent) => consent.choice === "aceito";
