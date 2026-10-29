/** Minúsculas, sem acento e só letras e números: "15W-40" e "15w 40" viram "15w40". */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// "15W-40", "15w 40" e "15 W 40" são uma viscosidade só, uma palavra só
const VISCOSITY = /(\d{1,2})\s*w\s*-?\s*(\d{2})/gi;
const joinViscosity = (text: string) => text.replace(VISCOSITY, "$1w$2");

/** O campo sem separadores e as posições onde cada palavra dele começa. */
function indexField(field: string) {
  const tokens = joinViscosity(field).split(/[^\p{L}\p{N}]+/u).map(normalizeSearch).filter(Boolean);
  const starts: number[] = [];
  let text = "";
  for (const t of tokens) {
    starts.push(text.length);
    text += t;
  }
  return { text, starts };
}

/**
 * Cada palavra da busca precisa aparecer em algum dos campos, começando onde
 * começa uma palavra do campo: "5w40" não acha 15W-40 e "psl55" acha PSL-55.
 * Os espaços da busca separam palavras, menos dentro de uma viscosidade;
 * hífens e acentos não contam.
 */
export function matchesSearch(fields: Array<string | null | undefined>, query: string): boolean {
  const words = joinViscosity(query).split(/\s+/).map(normalizeSearch).filter(Boolean);
  if (words.length === 0) return true;
  const indexed = fields.map((f) => indexField(f ?? ""));
  return words.every((w) => indexed.some(({ text, starts }) => starts.some((s) => text.startsWith(w, s))));
}
