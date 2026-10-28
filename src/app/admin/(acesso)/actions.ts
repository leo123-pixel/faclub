"use server";

import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";
import { SIGN_IN_MESSAGES, type SignInState } from "./messages";


export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: SIGN_IN_MESSAGES.wrong, email };

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return { error: SIGN_IN_MESSAGES.forbidden, email };
  }
  const back = String(form.get("volta") ?? "");
  redirect(back.startsWith("/admin/") && !back.startsWith("//") ? back : "/admin/produtos");
}
