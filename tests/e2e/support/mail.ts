import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { MAIL_DIR } from "../../../scripts/local-supabase/config.mjs";

type Mail = { to: string; subject: string; html: string; text: string };

/** Espera o e-mail mais novo para `to` no SMTP de captura e devolve o primeiro link do GoTrue. */
export async function latestLink(to: string, since: number, timeout = 10_000): Promise<string> {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const files = readdirSync(MAIL_DIR)
      .filter((f) => Number(f.split("-")[0]) >= since)
      .sort()
      .reverse();
    for (const f of files) {
      const mail = JSON.parse(readFileSync(path.join(MAIL_DIR, f), "utf8")) as Mail;
      if (!mail.to.includes(to)) continue;
      const link = (mail.html + mail.text).match(/https?:\/\/[^"'\s<>]+\/auth\/v1\/verify[^"'\s<>]+/);
      if (link) return link[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`nenhum e-mail para ${to}`);
}
