"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SAVE_FAILED } from "@/components/admin/toggle-result";
import { validateBanner, type BannerValues } from "@/lib/domain/banner-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export type BannerSaveResult = { ok: false; errors?: Partial<Record<keyof BannerValues, string>>; message?: string };

export async function saveBanner(values: BannerValues): Promise<BannerSaveResult> {
  const check = validateBanner(values);
  if (!check.ok) return { ok: false, errors: check.errors };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("banners").upsert(check.payload);
  if (error) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/", "layout");
  redirect("/admin/banners?salvo=1");
}
