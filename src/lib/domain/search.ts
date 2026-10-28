/** Minúsculas, sem acento e só letras e números: "15W-40" e "15w 40" viram "15w40". */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Cada palavra da busca precisa aparecer em algum dos campos. Os espaços da
 * busca separam palavras; hífens e acentos não contam.
 */
export function matchesSearch(fields: Array<string | null | undefined>, query: string): boolean {
  const words = query.split(/\s+/).map(normalizeSearch).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields.map((f) => normalizeSearch(f ?? "")).join("|");
  return words.every((w) => haystack.includes(w));
}
