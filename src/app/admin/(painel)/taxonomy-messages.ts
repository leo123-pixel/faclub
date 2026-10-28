export const TAXONOMY_MESSAGES = {
  nameTaken: "Já existe uma com esse nome.",
  required: "Campo obrigatório",
  failed: "Não foi possível salvar. Tente de novo.",
} as const;

const products = (n: number) => `${n} ${n === 1 ? "produto" : "produtos"}`;
export const countLabel = products;

export const categoryInUse = (n: number) =>
  `Esta categoria tem ${products(n)}. Mude a categoria deles antes de excluir.`;
export const brandInUse = (n: number) => `Esta marca tem ${products(n)}. Mude a marca deles antes de excluir.`;

export type TaxonomyResult = { ok: true } | { ok: false; message: string };
