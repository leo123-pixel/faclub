/**
 * Lê um valor em reais como a loja digita: "39,90", "1.234,56", "39.9" ou
 * "R$ 39,90". "1.234" é milhar. Devolve null para texto, vazio, negativo ou mais de 2 casas.
 */
export function parseBRL(input: string): number | null {
  let s = input.replace(/R\$/i, "").replace(/\s/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  // sem vírgula, ponto seguido de 3 dígitos é milhar: "1.234" é mil duzentos e trinta e quatro
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Number(s);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 1.234,56", com espaço comum depois do R$. */
export function formatBRL(value: number): string {
  return brl.format(value).replace(/ /g, " ");
}

/** Valor para preencher um campo de preço: 389.9 vira "389,90". */
export function toInputBRL(value: number | null): string {
  return value === null ? "" : value.toFixed(2).replace(".", ",");
}
