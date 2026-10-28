"use client";

import { useState, useTransition } from "react";
import { RowToggle } from "@/components/admin/RowToggle";
import type { CouponValues } from "@/lib/domain/coupon-input";
import { saveCoupon, setCouponActive } from "./actions";

export type CouponRow = { id: string; code: string; percent: number; description: string; isActive: boolean };

const empty: CouponValues = { code: "", percent: "", description: "", isActive: true };
const input = "mt-1 block h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink";

export function CouponsManager({ coupons }: { coupons: CouponRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState<CouponValues>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof CouponValues, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function edit(c: CouponRow) {
    setEditing(c.id);
    setValues({ code: c.code, percent: String(c.percent), description: c.description, isActive: c.isActive });
    setErrors({});
  }

  function reset() {
    setEditing(null);
    setValues(empty);
    setErrors({});
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await saveCoupon(editing, values);
      if (res.ok) {
        reset();
        setMessage("Cupom salvo.");
      } else {
        setErrors(res.errors ?? {});
        if (res.message) setMessage(res.message);
      }
    });
  }

  const err = (k: keyof CouponValues) =>
    errors[k] && (
      <span role="alert" className="mt-1 block text-sm font-normal text-low-ink">
        {errors[k]}
      </span>
    );

  return (
    <div className="space-y-4">
      {message && (
        <p role="status" className="rounded-xl bg-ok/10 px-4 py-3 font-semibold text-ok">
          {message}
        </p>
      )}
      <form
        onSubmit={submit}
        noValidate
        aria-label={editing ? "Editar cupom" : "Novo cupom"}
        className="rounded-2xl border border-line-soft bg-white p-4 sm:p-5"
      >
        <h2 className="mb-3 text-lg font-semibold text-ink">{editing ? "Editar cupom" : "Novo cupom"}</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px_2fr]">
          <label className="block text-sm font-semibold text-ink">
            Código
            <input value={values.code} onChange={(e) => setValues({ ...values, code: e.target.value })} className={input} />
            {err("code")}
          </label>
          <label className="block text-sm font-semibold text-ink">
            Percentual (%)
            <input
              inputMode="numeric"
              value={values.percent}
              onChange={(e) => setValues({ ...values, percent: e.target.value })}
              className={input}
            />
            {err("percent")}
          </label>
          <label className="block text-sm font-semibold text-ink">
            Texto
            <input
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
              placeholder="Ex.: 10% de desconto na troca feita na loja."
              className={input}
            />
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={pending} className="h-11 rounded-xl bg-ink px-5 font-semibold text-gold disabled:opacity-60">
            Salvar cupom
          </button>
          {editing && (
            <button type="button" onClick={reset} className="h-11 rounded-xl border border-line bg-white px-5 font-semibold text-ink">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul aria-label="Cupons" className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-white">
        {coupons.map((c) => (
          <li key={c.id} aria-label={c.code} className="flex flex-wrap items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-ink">
                {c.code} <span className="ml-2 text-base font-semibold text-gold-ink">{c.percent}%</span>
              </p>
              <p className="text-[13px] text-muted">{c.description || "Sem texto"}</p>
            </div>
            <span className="flex items-center gap-2 text-sm text-muted">
              Ativo
              <RowToggle
                key={`${c.id}-${c.isActive}`}
                initial={c.isActive}
                label={`Ativo: ${c.code}`}
                action={setCouponActive.bind(null, c.id)}
              />
            </span>
            <button
              type="button"
              onClick={() => edit(c)}
              className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink"
            >
              Editar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
