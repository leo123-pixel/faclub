// Backup do FAC LUB (BKP-01): estrutura e dados do schema public, logins do
// painel (auth.users e auth.identities) e todas as fotos do bucket, numa pasta
// com a data. Qualquer falha sai com código diferente de zero.
//
//   SUPABASE_DB_URL=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.mjs [pasta]
//
// PG_DUMP escolhe o binário (o do workflow é o cliente 17).
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const PAGE = 100;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`falta a variável ${name}`);
  return value;
}

// A mensagem de erro não repete a linha de comando, que tem a senha do banco.
function pgDump(dbUrl, file, args) {
  const run = spawnSync(process.env.PG_DUMP ?? "pg_dump", ["--no-owner", "--file", file, ...args, dbUrl], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (run.error) throw new Error(`pg_dump não rodou: ${run.error.code ?? run.error.message}`);
  if (run.status !== 0) throw new Error(`pg_dump saiu com código ${run.status} (${path.basename(file)})`);
}

/** Todos os caminhos de arquivo do bucket, descendo nas pastas. */
async function listAll(storage, prefix = "") {
  const keys = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await storage.list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`listagem de ${BUCKET}/${prefix}: ${error.message}`);
    for (const item of data) {
      const key = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) keys.push(...(await listAll(storage, key)));
      else keys.push(key);
    }
    if (data.length < PAGE) return keys;
  }
}

async function main() {
  const dbUrl = env("SUPABASE_DB_URL");
  const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const out = path.resolve(process.argv[2] ?? path.join("backup", `faclub-${new Date().toISOString().slice(0, 10)}`));
  mkdirSync(out, { recursive: true });

  console.log(`backup em ${out}`);
  const publicSql = path.join(out, "public.sql");
  pgDump(dbUrl, publicSql, ["--schema=public", "--extension=unaccent"]);
  // todo projeto do Supabase já tem o schema public; sem isso a restauração para na 1ª linha
  writeFileSync(publicSql, readFileSync(publicSql, "utf8").replace(/^CREATE SCHEMA public;$/m, "CREATE SCHEMA IF NOT EXISTS public;"));
  pgDump(dbUrl, path.join(out, "auth.sql"), ["--data-only", "--table=auth.users", "--table=auth.identities"]);

  const storage = supabase.storage.from(BUCKET);
  const keys = await listAll(storage);
  for (const key of keys) {
    const { data, error } = await storage.download(key);
    if (error) throw new Error(`download de ${BUCKET}/${key}: ${error.message}`);
    const target = path.join(out, "storage", BUCKET, key);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(await data.arrayBuffer()));
  }
  writeFileSync(path.join(out, "manifest.json"), JSON.stringify({ at: new Date().toISOString(), bucket: BUCKET, files: keys }, null, 2));
  console.log(`banco exportado e ${keys.length} fotos copiadas`);
}

main().catch((err) => {
  console.error(`backup falhou: ${err.message}`);
  process.exit(1);
});
