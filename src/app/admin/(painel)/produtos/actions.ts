"use server";

import { revalidatePath } from "next/cache";
import { SAVE_FAILED, type ToggleResult } from "@/components/admin/toggle-result";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PROMO_NEEDS_PRICE } from "./messages";

async function setFlag(id: string, column: "is_visible" | "is_promo", value: boolean): Promise<ToggleResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({ [column]: value })
    .eq("id", id)
    .select("id");
  if (error) {
    return { ok: false, message: error.message.includes("promo_requires_price") ? PROMO_NEEDS_PRICE : SAVE_FAILED };
  }
  if (!data?.length) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setVisibility(id: string, value: boolean) {
  return setFlag(id, "is_visible", value);
}

export async function setPromo(id: string, value: boolean) {
  return setFlag(id, "is_promo", value);
}
