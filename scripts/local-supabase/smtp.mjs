// SMTP de captura: cada e-mail que o GoTrue manda vira um .json em .local/mail.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";
import { MAIL_DIR, PORTS } from "./config.mjs";

export function startSmtp() {
  mkdirSync(MAIL_DIR, { recursive: true });
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    onAuth: (_auth, _session, cb) => cb(null, { user: "local" }),
    onData(stream, _session, cb) {
      simpleParser(stream)
        .then((mail) => {
          const to = mail.to && !Array.isArray(mail.to) ? mail.to.text : "";
          const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
          writeFileSync(
            path.join(MAIL_DIR, name),
            JSON.stringify({ to, subject: mail.subject, html: mail.html || "", text: mail.text || "" }),
          );
          cb();
        })
        .catch(cb);
    },
  });
  return new Promise((resolve) => server.listen(PORTS.smtp, "127.0.0.1", () => resolve(server)));
}
