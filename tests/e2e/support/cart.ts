import { serviceClient } from "./supabase";

/** Id do produto pelo slug, para montar linhas do carrinho nos testes. */
export async function productId(slug: string) {
  const { data, error } = await serviceClient().from("products").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id as string;
}

export async function cartLine(slug: string, label: string, qty: number, title = slug) {
  return { productId: await productId(slug), slug, title, label, qty };
}
