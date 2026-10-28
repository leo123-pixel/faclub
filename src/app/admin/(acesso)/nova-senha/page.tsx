import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { NewPasswordForm } from "./NewPasswordForm";

export const metadata: Metadata = { title: "Nova senha | FAC LUB Painel", robots: { index: false } };

export default async function NewPasswordPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/esqueci-senha?erro=link");
  return <NewPasswordForm />;
}
