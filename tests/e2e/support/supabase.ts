import { createClient } from "@supabase/supabase-js";
import { ANON_KEY, API_URL, SERVICE_ROLE_KEY } from "../../../scripts/local-supabase/config.mjs";

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

/** Cliente com service role: prepara e confere dados nos testes. */
export const serviceClient = () => createClient(API_URL, SERVICE_ROLE_KEY, noSession);
/** Cliente anônimo, como um visitante. */
export const anonClient = () => createClient(API_URL, ANON_KEY, noSession);
