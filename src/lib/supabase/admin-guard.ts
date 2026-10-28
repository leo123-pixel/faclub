import "server-only";
import { redirect } from "next/navigation";
import { isAdminUser } from "./env";
import { createServerSupabase } from "./server";

/**
 * Garante um admin na página ou action. Sem sessão vai para o login; com
 * sessão sem papel admin também (o proxy já encerrou essa sessão).
 */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  if (!isAdminUser(data.user)) redirect("/admin/login?erro=sem-permissao");
  return { supabase, user: data.user };
}
