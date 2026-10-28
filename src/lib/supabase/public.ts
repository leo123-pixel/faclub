import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente anônimo das páginas públicas: sem cookies, para as páginas
 * continuarem estáticas (ISR). O RLS só deixa ler o que é público.
 */
export const createPublicSupabase = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
