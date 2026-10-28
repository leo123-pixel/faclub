export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Papel do painel, gravado em app_metadata (só o service role escreve ali). */
export const isAdminUser = (user: { app_metadata?: Record<string, unknown> } | null | undefined) =>
  user?.app_metadata?.role === "admin";
