/** Um endereço do site antigo e o destino no site novo. */
export type LegacyUrl = { from: string; to: string };

/** Uma entrada de `redirects` do next.config.ts, com 301 (o `permanent` do Next dá 308). */
export type Redirect = { source: string; destination: string; statusCode: 301 };

const SAFE_PATH = /^\/[A-Za-z0-9\-_/.]*$/;
const INTERNAL = /^\/(?!\/)[A-Za-z0-9\-_/.#?=&]*$/;

/** Confere a lista: caminhos seguros, destinos do site novo, sem repetição. */
export function checkLegacyList(list: LegacyUrl[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const { from, to } of list) {
    const key = from.replace(/\/+$/, "") || "/";
    if (!SAFE_PATH.test(from) || key === "/") errors.push(`caminho antigo inválido: ${from}`);
    if (!INTERNAL.test(to)) errors.push(`destino fora do site: ${to}`);
    if (seen.has(key)) errors.push(`caminho repetido: ${from}`);
    seen.add(key);
  }
  return errors;
}

/** Regras gerais do WordPress que vão para a Home (REDIR-01 AC 2). */
export const WORDPRESS_RULES: Redirect[] = ["/wp-content", "/wp-admin", "/feed"].flatMap((base) => [
  { source: base, destination: "/", statusCode: 301 as const },
  { source: `${base}/:path*`, destination: "/", statusCode: 301 as const },
]);

/** Cada endereço com e sem a barra final, mais as regras gerais (REDIR-01 AC 1 e 2). */
export function buildRedirects(list: LegacyUrl[]): Redirect[] {
  const errors = checkLegacyList(list);
  if (errors.length) throw new Error(`redirects/legacy-urls.json: ${errors.join("; ")}`);
  const pairs = list.flatMap(({ from, to }) => {
    const bare = from.replace(/\/+$/, "");
    return [
      { source: bare, destination: to, statusCode: 301 as const },
      { source: `${bare}/`, destination: to, statusCode: 301 as const },
    ];
  });
  return [...pairs, ...WORDPRESS_RULES];
}
