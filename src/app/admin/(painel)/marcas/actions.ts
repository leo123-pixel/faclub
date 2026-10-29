"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { brandInUse, TAXONOMY_MESSAGES, type TaxonomyResult } from "../taxonomy-messages";

export async function saveBrand(id: string | null, name: string, logoPath: string | null): Promise<TaxonomyResult> {
  const clean = name.trim();
  if (!clean) return { ok: false, message: TAXONOMY_MESSAGES.required };
  const { supabase } = await requireAdmin();
  const { error } = id
    ? await supabase.from("brands").update({ name: clean }).eq("id", id)
    : await supabase.from("brands").insert({ name: clean, logo_path: logoPath });
  if (error) return { ok: false, message: error.code === "23505" ? TAXONOMY_MESSAGES.nameTaken : TAXONOMY_MESSAGES.failed };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<TaxonomyResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) {
    const inUse = error.message.match(/brand_in_use:(\d+)/);
    return { ok: false, message: inUse ? brandInUse(Number(inUse[1])) : TAXONOMY_MESSAGES.failed };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
