"use client";

import Link from "next/link";
import { useConsent } from "./ConsentProvider";

/** Aviso de cookies (CONS-01 AC 1): nada de GA4 ou Pixel antes da escolha. */
export function CookieBanner() {
  const { bannerOpen, accept, reject } = useConsent();
  if (!bannerOpen) return null;
  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[760px] rounded-[20px] bg-ink p-5 text-white shadow-2xl sm:flex sm:items-center sm:gap-5"
    >
      <p className="text-[14px] leading-relaxed text-white/85">
        Usamos cookies do Google Analytics e do Meta Pixel para medir visitas e anúncios. Você escolhe se aceita.{" "}
        <Link href="/politica-de-privacidade" className="font-semibold text-white underline underline-offset-2">
          Política de privacidade
        </Link>
      </p>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={reject}
          className="h-11 rounded-full px-5 text-[15px] font-semibold text-white ring-1 ring-white/40 hover:bg-white/10"
        >
          Recusar
        </button>
        <button type="button" onClick={accept} className="h-11 rounded-full bg-gold px-5 text-[15px] font-semibold text-ink hover:bg-gold/90">
          Aceitar
        </button>
      </div>
    </section>
  );
}
