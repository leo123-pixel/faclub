import { describe, expect, it } from "vitest";
import { canTrack, CONSENT_DAYS, NO_CHOICE, readConsent, writeConsent } from "./consent";

const NOW = new Date("2026-10-28T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const at = (ms: number) => new Date(NOW.getTime() + ms);

describe("escolha de cookies", () => {
  it("aceite e recusa valem até 180 dias e somem logo depois", () => {
    expect(CONSENT_DAYS).toBe(180);
    for (const choice of ["aceito", "recusado"] as const) {
      const saved = writeConsent(choice, NOW);
      expect(readConsent(saved, at(179 * DAY))).toEqual({ choice });
      expect(readConsent(saved, at(180 * DAY))).toEqual({ choice });
      expect(readConsent(saved, at(180 * DAY + 60 * 1000))).toEqual(NO_CHOICE);
    }
  });

  it("texto inválido, versão desconhecida ou escolha estranha dão sem escolha", () => {
    expect(readConsent(null, NOW)).toEqual(NO_CHOICE);
    expect(readConsent("{", NOW)).toEqual(NO_CHOICE);
    expect(readConsent(JSON.stringify({ version: 2, choice: "aceito", at: NOW.toISOString() }), NOW)).toEqual(NO_CHOICE);
    expect(readConsent(JSON.stringify({ version: 1, choice: "talvez", at: NOW.toISOString() }), NOW)).toEqual(NO_CHOICE);
    expect(readConsent(JSON.stringify({ version: 1, choice: "aceito", at: "ontem" }), NOW)).toEqual(NO_CHOICE);
  });

  it("só o aceite permite medir", () => {
    expect(canTrack({ choice: "aceito" })).toBe(true);
    expect(canTrack({ choice: "recusado" })).toBe(false);
    expect(canTrack(NO_CHOICE)).toBe(false);
  });
});
