"use client";

import type { AnchorHTMLAttributes } from "react";
import { clickWhatsappEvent, type WhatsappLocation } from "@/lib/domain/analytics-events";
import { track } from "./track";

/** Botão que abre o WhatsApp fora do envio do pedido: envia `click_whatsapp` com o local (CONS-01 AC 8). */
export function TrackedLink({ location, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { location: WhatsappLocation }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(clickWhatsappEvent(location));
        onClick?.(e);
      }}
    />
  );
}
