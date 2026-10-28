"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../actions";
import type { SignInState } from "../messages";

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {
    error: initialError,
    email: "",
  });

  return (
    <form action={action} className="space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink">Entrar no painel</h1>
      <label className="block text-sm font-medium text-ink">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          key={state.email}
          className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-ink"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-low px-3 py-2 text-sm text-low-ink">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-ink font-semibold text-gold disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <Link href="/admin/esqueci-senha" className="block text-center text-sm text-muted underline">
        Esqueci minha senha
      </Link>
    </form>
  );
}
