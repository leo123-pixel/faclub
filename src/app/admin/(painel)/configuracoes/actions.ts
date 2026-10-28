"use server";

import { revalidatePath } from "next/cache";
import { validateSettings, type SettingsValues } from "@/lib/domain/settings-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export type SettingsSaveResult =
  | { ok: true }
  | { ok: false; errors?: Partial<Record<keyof SettingsValues, string>>; message?: string };

export async function saveSettings(values: SettingsValues): Promise<SettingsSaveResult> {
  const check = validateSettings(values);
  if (!check.ok) return { ok: false, errors: check.errors };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("settings").upsert(check.payload);
  if (error) return { ok: false, message: "Não foi possível salvar. Tente de novo." };
  revalidatePath("/", "layout");
  return { ok: true };
}
