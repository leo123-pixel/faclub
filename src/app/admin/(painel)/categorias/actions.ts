"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { categoryInUse, TAXONOMY_MESSAGES, type TaxonomyResult } from "../taxonomy-messages";

const done = (): TaxonomyResult => {
  revalidatePath("/", "layout");
  return { ok: true };
};

export async function saveCategory(id: string | null, name: string): Promise<TaxonomyResult> {
  const clean = name.trim();
  if (!clean) return { ok: false, message: TAXONOMY_MESSAGES.required };
  const { supabase } = await requireAdmin();
  const { error } = id
    ? await supabase.from("categories").update({ name: clean }).eq("id", id)
    : await supabase.from("categories").insert({ name: clean });
  if (error) return { ok: false, message: error.code === "23505" ? TAXONOMY_MESSAGES.nameTaken : TAXONOMY_MESSAGES.failed };
  return done();
}

/** Troca a posição com a vizinha de cima ou de baixo. */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<TaxonomyResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("categories").select("id, position").order("position").order("name");
  if (error || !data) return { ok: false, message: TAXONOMY_MESSAGES.failed };
  const i = data.findIndex((c) => c.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= data.length) return { ok: true };
  // posições sequenciais antes da troca, para não depender de valores repetidos
  const order = data.map((c) => c.id);
  [order[i], order[j]] = [order[j], order[i]];
  for (const [n, cid] of order.entries()) {
    const res = await supabase.from("categories").update({ position: n + 1 }).eq("id", cid);
    if (res.error) return { ok: false, message: TAXONOMY_MESSAGES.failed };
  }
  return done();
}

export async function deleteCategory(id: string): Promise<TaxonomyResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    const inUse = error.message.match(/category_in_use:(\d+)/);
    return { ok: false, message: inUse ? categoryInUse(Number(inUse[1])) : TAXONOMY_MESSAGES.failed };
  }
  return done();
}
