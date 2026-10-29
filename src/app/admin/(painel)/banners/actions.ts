"use server";

import { revalidatePath } from "next/cache";
import { SAVE_FAILED, type ToggleResult } from "@/components/admin/toggle-result";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function setBannerActive(id: string, value: boolean): Promise<ToggleResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("banners").update({ is_active: value }).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<ToggleResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("banners").delete().eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/", "layout");
  return { ok: true };
}
