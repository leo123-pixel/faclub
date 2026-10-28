#!/usr/bin/env node
// Cria ou atualiza um administrador do painel no Supabase real.
// Rodado pela Onbind, que tem a chave service_role (nunca vai para o navegador).
//
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/create-admin.mjs pessoa@faclubrificantes.com.br 'senha-com-8+'
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password || password.length < 8 || !url || !key) {
  console.error("Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin.mjs <email> <senha 8+>");
  process.exit(2);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;

const found = data.users.find((u) => u.email === email);
const attrs = { password, email_confirm: true, app_metadata: { role: "admin" } };
const res = found
  ? await admin.auth.admin.updateUserById(found.id, attrs)
  : await admin.auth.admin.createUser({ email, ...attrs });
if (res.error) throw res.error;
console.log(`${found ? "Atualizado" : "Criado"}: ${email} com papel admin`);
