import { canTrack } from "@/lib/domain/consent";
import type { AnalyticsEvent } from "@/lib/domain/analytics-events";
import { getConsent } from "./ConsentProvider";

type Queue = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...args: unknown[]) => void };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Queue;
    fbq?: Queue;
    _fbq?: Queue;
  }
}

let ready = false;
const pending: AnalyticsEvent[] = [];

function send(e: AnalyticsEvent) {
  window.gtag?.("event", e.name, e.params);
  window.fbq?.("trackCustom", e.name, e.params);
}

/**
 * Envia um evento ao GA4 e ao Pixel; sem aceite, não faz nada (CONS-01 AC 2).
 * Antes de as filas existirem, o evento espera o `Analytics` montar.
 */
export function track(e: AnalyticsEvent) {
  if (!canTrack(getConsent())) return;
  if (!ready) {
    pending.push(e);
    return;
  }
  send(e);
}

export function markAnalyticsReady() {
  ready = true;
  pending.splice(0).forEach(send);
}

/** Só para testes. */
export function resetTrackForTests() {
  ready = false;
  pending.length = 0;
}
