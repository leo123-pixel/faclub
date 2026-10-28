"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "../messages";
import { requestReset } from "../reset-actions";

export function ResetForm({ initialMessage }: { initialMessage: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestReset, { message: initialMessage });
  return (
    <form action={action} className="space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink">Esqueci minha senha</h1>
      <p className="text-sm text-muted">Informe o e-mail do painel. Vamos mandar um link para criar uma nova senha.</p>
      <label className="block text-sm font-medium text-ink">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-ink"
        />
      </label>
      {state.message && (
        <p role="status" className="rounded-lg bg-gold-soft px-3 py-2 text-sm text-gold-ink">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-ink font-semibold text-gold disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar link"}
      </button>
      <Link href="/admin/login" className="block text-center text-sm text-muted underline">
        Voltar para o login
      </Link>
    </form>
  );
}
