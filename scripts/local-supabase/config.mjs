// Portas, segredo e chaves do Supabase local de teste (AD-010). O segredo é o
// mesmo padrão do `supabase start`; nada disto vale fora da máquina de teste.
import { createHmac } from "node:crypto";
import path from "node:path";

// Rodado sempre da raiz do repositório (npm, Playwright e Vitest fazem isso);
// sem import.meta porque o Playwright transpila este arquivo para CommonJS.
export const ROOT = path.resolve(process.env.FACLUB_ROOT ?? process.cwd());
export const LOCAL = path.join(ROOT, ".local");

export const PORTS = { gateway: 54321, pg: 54330, postgrest: 54331, auth: 54332, smtp: 54325, app: 3100 };
export const JWT_SECRET = "super-secret-jwt-token-with-at-least-32-characters-long";
export const API_URL = `http://127.0.0.1:${PORTS.gateway}`;
export const APP_URL = `http://localhost:${PORTS.app}`;
export const DB_URL = `postgres://postgres@127.0.0.1:${PORTS.pg}/postgres`;

const b64 = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");

export function signJwt(payload, secret = JWT_SECRET) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function verifyJwt(token, secret = JWT_SECRET) {
  const [head, body, sig] = String(token).split(".");
  if (!sig) return null;
  const expected = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  if (expected !== sig) return null;
  const claims = JSON.parse(Buffer.from(body, "base64url").toString());
  if (claims.exp && claims.exp * 1000 < Date.now()) return null;
  return claims;
}

const longLived = { iss: "supabase-local", iat: 1700000000, exp: 4900000000 };
export const ANON_KEY = signJwt({ ...longLived, role: "anon" });
export const SERVICE_ROLE_KEY = signJwt({ ...longLived, role: "service_role" });

// Segredo de POST /api/revalidar no app de teste.
export const REVALIDATE_SECRET = "revalidar-local";

export const APP_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: APP_URL,
  REVALIDATE_SECRET,
  // IDs de teste: o e2e intercepta os scripts do Google e da Meta
  NEXT_PUBLIC_GA4_ID: "G-FACLUBTEST",
  NEXT_PUBLIC_META_PIXEL_ID: "1234567890",
};

export const MAIL_DIR = path.join(LOCAL, "mail");
export const STORAGE_DIR = path.join(LOCAL, "storage");
