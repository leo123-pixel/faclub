"use client";

import { useEffect } from "react";
import { canTrack } from "@/lib/domain/consent";
import { useConsent } from "./ConsentProvider";
import { markAnalyticsReady } from "./track";

export const GA4_SRC = "https://www.googletagmanager.com/gtag/js?id=";
export const PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

function addScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
}

function startGa4(id: string) {
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // o gtag.js lê os argumentos como estão (arguments), não como array
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id);
  }
  addScript(GA4_SRC + encodeURIComponent(id));
}

function startPixel(id: string) {
  if (!window.fbq) {
    // a fila padrão do Pixel: guarda as chamadas até o fbevents.js chegar
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    } as NonNullable<Window["fbq"]>;
    fbq.queue = [];
    Object.assign(fbq, { push: fbq, loaded: true, version: "2.0" });
    window.fbq = fbq;
    window._fbq = window._fbq ?? fbq;
    fbq("init", id);
    fbq("track", "PageView");
  }
  addScript(PIXEL_SRC);
}

/**
 * GA4 e Pixel só depois do aceite (CONS-01 AC 2 e 3); sem ID, o script
 * correspondente não carrega (Edge Case).
 */
export function Analytics({ ga4Id, pixelId }: { ga4Id: string; pixelId: string }) {
  const { consent } = useConsent();
  const accepted = canTrack(consent);
  useEffect(() => {
    if (!accepted) return;
    if (ga4Id) startGa4(ga4Id);
    if (pixelId) startPixel(pixelId);
    markAnalyticsReady();
  }, [accepted, ga4Id, pixelId]);
  return null;
}
