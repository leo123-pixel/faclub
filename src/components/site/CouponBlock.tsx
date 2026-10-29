"use client";

import { useEffect, useRef, useState } from "react";
import { copyCouponEvent, joinGroupEvent } from "@/lib/domain/analytics-events";
import { couponHeadline, type Coupon } from "@/lib/domain/home";
import { track } from "./track";

export const COUPON_TEXT = "Mostre o cupom no atendimento e entre no grupo para receber as ofertas da semana.";
export const COUPON_SCOPE = "O desconto vale só para serviços feitos na loja.";
export const COPY_FALLBACK = "Selecione e copie o código.";

/** Cartão do cupom (CUPOM-01): copiar o código e entrar no grupo de ofertas. */
export function CouponBlock({ coupon, groupLink }: { coupon: Coupon; groupLink: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== "copied") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setState("copied");
      track(copyCouponEvent(coupon.code));
    } catch {
      // sem permissão (ou sem a API): o código fica selecionado para copiar à mão
      input.current?.focus();
      input.current?.select();
      setState("manual");
    }
  }

  return (
    <div className="w-full max-w-[524px] rounded-[24px] bg-white p-6 text-center text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8">
      <h2 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[40px]">
        {couponHeadline(coupon)}
      </h2>
      <p className="mx-auto mt-4 max-w-[420px] text-[16px] leading-relaxed text-muted">{COUPON_TEXT}</p>
      <p className="mt-1 text-[13px] text-muted">{COUPON_SCOPE}</p>

      <div className="mt-6 flex items-center gap-3 rounded-[18px] border border-dashed border-gold bg-gold-soft/60 py-[10px] pl-5 pr-[10px]">
        <input
          ref={input}
          readOnly
          value={coupon.code}
          aria-label="Código do cupom"
          className="min-w-0 flex-1 bg-transparent font-display text-[22px] font-semibold tracking-tight text-ink outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink px-[18px] text-[14px] font-semibold text-white hover:bg-navy-2"
        >
          {state === "copied" ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-[13px] text-muted">
        {state === "manual" ? COPY_FALLBACK : ""}
      </p>

      {groupLink && (
        <a
          href={groupLink}
          onClick={() => track(joinGroupEvent())}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex h-[50px] items-center justify-center rounded-full border border-line text-[15px] font-semibold text-ink hover:bg-bg"
        >
          Entrar no grupo de ofertas
        </a>
      )}
    </div>
  );
}
