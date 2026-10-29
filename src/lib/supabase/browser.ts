"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/** Cliente do navegador, usado para enviar fotos ao Storage com a sessão do admin. */
export const createBrowserSupabase = () => createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
