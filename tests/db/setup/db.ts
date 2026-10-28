import { Client } from "pg";
import { inject } from "vitest";

export type Claims = {
  sub?: string;
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export type Tx = {
  query: <R = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<R[]>;
  /** Troca para anon, authenticated ou service_role com as claims dadas. */
  as: (role: "anon" | "authenticated" | "service_role", claims?: Claims) => Promise<void>;
  /** Volta ao superusuário (para preparar dados no meio do teste). */
  asSuper: () => Promise<void>;
  /** Roda o SQL num savepoint e devolve a mensagem de erro, ou null se passou. */
  error: (sql: string, params?: unknown[]) => Promise<string | null>;
};

export const ADMIN: Claims = {
  sub: "00000000-0000-0000-0000-00000000a001",
  role: "authenticated",
  app_metadata: { role: "admin" },
};
export const USER: Claims = {
  sub: "00000000-0000-0000-0000-00000000b001",
  role: "authenticated",
  app_metadata: {},
};
/** Usuário que se declarou admin em user_metadata, campo que ele mesmo edita. */
export const SELF_DECLARED_ADMIN: Claims = {
  sub: "00000000-0000-0000-0000-00000000c001",
  role: "authenticated",
  app_metadata: {},
  user_metadata: { role: "admin" },
};

/** Roda fn numa transação que sempre volta atrás, isolando cada teste. */
export async function tx(fn: (t: Tx) => Promise<void>) {
  const client = new Client({ connectionString: inject("dbUrl") });
  await client.connect();
  let sp = 0;
  const t: Tx = {
    query: async (sql, params) => (await client.query(sql, params)).rows,
    as: async (role, claims) => {
      await client.query("reset role");
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ role, ...(claims ?? {}) }),
      ]);
      await client.query(`set local role ${role}`);
    },
    asSuper: async () => {
      await client.query("reset role");
      await client.query("select set_config('request.jwt.claims', '', true)");
    },
    error: async (sql, params) => {
      const name = `sp${++sp}`;
      await client.query(`savepoint ${name}`);
      try {
        await client.query(sql, params);
        await client.query(`release savepoint ${name}`);
        return null;
      } catch (err) {
        await client.query(`rollback to savepoint ${name}`);
        return (err as Error).message;
      }
    },
  };
  try {
    await client.query("begin");
    await fn(t);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}
