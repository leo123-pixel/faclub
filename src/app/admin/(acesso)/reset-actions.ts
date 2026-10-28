"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { RESET_MESSAGES, type FormState } from "./messages";

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

/** Sempre a mesma resposta, exista ou não a conta. */
export async function requestReset(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/admin/auth/callback?next=/admin/nova-senha`,
  });
  return { message: RESET_MESSAGES.sent };
}

export async function setNewPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { message: RESET_MESSAGES.short };
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/esqueci-senha?erro=link");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { message: RESET_MESSAGES.failed };
  redirect("/admin/produtos");
}
