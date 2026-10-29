"use client";

import { useActionState } from "react";
import type { FormState } from "../messages";
import { setNewPassword } from "../reset-actions";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setNewPassword, { message: null });
  return (
    <form action={action} className="space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink">Criar nova senha</h1>
      <label className="block text-sm font-medium text-ink">
        Nova senha
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-ink"
        />
      </label>
      <p className="text-xs text-muted">Use ao menos 8 caracteres.</p>
      {state.message && (
        <p role="alert" className="rounded-lg bg-low px-3 py-2 text-sm text-low-ink">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-ink font-semibold text-gold disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
