"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY, NO_CHOICE, readConsent, writeConsent, type Consent, type ConsentChoice } from "@/lib/domain/consent";

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

function choose(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, writeConsent(choice, new Date()));
  } catch {
    // sem armazenamento: a escolha vale só nesta visita
  }
  set({ consent: { choice }, reopened: false });
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
