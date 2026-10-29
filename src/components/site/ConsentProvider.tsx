"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY, isTrackerCookie, NO_CHOICE, readConsent, writeConsent, type Consent, type ConsentChoice } from "@/lib/domain/consent";

// A escolha mora no localStorage por 180 dias (CONS-01 AC 3 e 4). Com o
// armazenamento bloqueado, vale só na visita e o aviso volta na próxima.

type State = { consent: Consent; reopened: boolean };

let current: State | null = null;
const listeners = new Set<() => void>();
const SERVER_STATE: State = { consent: NO_CHOICE, reopened: false };

function load(): State {
  try {
    return { consent: readConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY), new Date()), reopened: false };
  } catch {
    return { consent: NO_CHOICE, reopened: false };
  }
}

function snapshot(): State {
  if (current === null) current = load();
  return current;
}

function set(next: State) {
  current = next;
  listeners.forEach((l) => l());
}

/** Apaga os cookies do GA4 e do Pixel no host e nos domínios acima dele. */
function clearTrackerCookies() {
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter(isTrackerCookie);
  const labels = window.location.hostname.split(".");
  const domains = ["", ...labels.slice(0, -1).map((_, i) => `; domain=.${labels.slice(i).join(".")}`)];
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

/**
 * Recusar depois de aceitar (CONS-02): avisa o GA4 e o Pixel, apaga os cookies
 * deles e recarrega a página, que volta sem os scripts.
 */
function revoke() {
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.fbq?.("consent", "revoke");
  clearTrackerCookies();
  window.location.reload();
}

function choose(choice: ConsentChoice) {
  const wasAccepted = snapshot().consent.choice === "aceito";
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, writeConsent(choice, new Date()));
  } catch {
    // sem armazenamento: a escolha vale só nesta visita
  }
  set({ consent: { choice }, reopened: false });
  if (wasAccepted && choice === "recusado") revoke();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const consentActions = {
  accept: () => choose("aceito"),
  reject: () => choose("recusado"),
  /** "Preferências de cookies" (CONS-01 AC 11). */
  reopen: () => set({ ...snapshot(), reopened: true }),
};

/** A escolha atual, para quem está fora do React (track). */
export const getConsent = () => snapshot().consent;

/** Só para testes: esquece a escolha em memória, como uma visita nova. */
export const resetConsentForTests = () => {
  current = null;
};

export function useConsent() {
  const state = useSyncExternalStore(subscribe, snapshot, () => SERVER_STATE);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return {
    consent: state.consent,
    bannerOpen: hydrated && (state.consent.choice === null || state.reopened),
    ...consentActions,
  };
}
