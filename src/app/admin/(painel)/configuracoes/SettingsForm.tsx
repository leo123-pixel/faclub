"use client";

import { useState, useTransition } from "react";
import type { SettingsValues } from "@/lib/domain/settings-input";
import { saveSettings } from "./actions";

const FIELDS: { key: keyof SettingsValues; label: string; hint?: string; type?: string; wide?: boolean }[] = [
  { key: "whatsapp", label: "WhatsApp", hint: "Usado nos botões de agendar e no envio do pedido", type: "tel" },
  { key: "phone", label: "Telefone", type: "tel" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "address", label: "Endereço", wide: true },
  { key: "hoursWeekdays", label: "Horário de segunda a sexta", hint: "Ex.: 7h às 18h" },
  { key: "hoursSaturday", label: "Horário de sábado", hint: "Ex.: 8h às 13h" },
  { key: "groupLink", label: "Link do grupo de ofertas", hint: "Vazio esconde o botão no site", type: "url" },
  { key: "instagram", label: "Instagram", hint: "Vazio esconde o link no site", type: "url" },
  { key: "scheduleMessage", label: "Mensagem de agendamento", hint: "Texto que já vem escrito no WhatsApp", wide: true },
];

const input = "mt-1 block h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink";

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsValues, string>>>({});
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    start(async () => {
      const res = await saveSettings(values);
      if (res.ok) {
        setErrors({});
        setStatus({ ok: true, text: "Configurações salvas." });
      } else {
        setErrors(res.errors ?? {});
        if (res.message) setStatus({ ok: false, text: res.message });
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {status && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`rounded-xl px-4 py-3 font-semibold ${status.ok ? "bg-ok/10 text-ok" : "bg-low text-low-ink"}`}
        >
          {status.text}
        </p>
      )}
      <section aria-label="Dados da loja" className="rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-semibold text-ink">
                {f.label}
                <input
                  type={f.type ?? "text"}
                  value={values[f.key]}
                  aria-describedby={f.hint ? `${f.key}-dica` : undefined}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={input}
                />
              </label>
              {f.hint && (
                <p id={`${f.key}-dica`} className="mt-1 text-[13px] text-muted">
                  {f.hint}
                </p>
              )}
              {errors[f.key] && (
                <p role="alert" className="mt-1 text-sm text-low-ink">
                  {errors[f.key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-ink px-5 font-semibold text-gold disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}
