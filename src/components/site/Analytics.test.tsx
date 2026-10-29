import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_STORAGE_KEY } from "@/lib/domain/consent";
import { Analytics, GA4_SRC, PIXEL_SRC } from "./Analytics";
import { resetConsentForTests } from "./ConsentProvider";
import { resetTrackForTests } from "./track";

const scripts = () => Array.from(document.head.querySelectorAll("script")).map((s) => s.getAttribute("src"));

function accept() {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ version: 1, choice: "aceito", at: new Date().toISOString() }));
}

describe("GA4 e Pixel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.head.innerHTML = "";
    delete window.gtag;
    delete window.fbq;
    delete window._fbq;
    delete window.dataLayer;
    resetConsentForTests();
    resetTrackForTests();
  });

  it("sem o ID do GA4, só o Pixel carrega, sem erro", () => {
    accept();
    render(<Analytics ga4Id="" pixelId="123" />);
    expect(scripts()).toEqual([PIXEL_SRC]);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq?.queue).toEqual([
      ["init", "123"],
      ["track", "PageView"],
    ]);
  });

  it("sem o ID do Pixel, só o GA4 carrega, sem erro", () => {
    accept();
    render(<Analytics ga4Id="G-TESTE" pixelId="" />);
    expect(scripts()).toEqual([`${GA4_SRC}G-TESTE`]);
    expect(window.fbq).toBeUndefined();
    expect(Array.from(window.dataLayer![1] as ArrayLike<unknown>)).toEqual(["config", "G-TESTE"]);
  });

  it("sem aceite, nada carrega mesmo com os dois IDs", () => {
    render(<Analytics ga4Id="G-TESTE" pixelId="123" />);
    expect(scripts()).toEqual([]);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq).toBeUndefined();
  });
});
