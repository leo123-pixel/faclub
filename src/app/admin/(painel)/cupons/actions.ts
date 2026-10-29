"use server";

import { revalidatePath } from "next/cache";
import { SAVE_FAILED, type ToggleResult } from "@/components/admin/toggle-result";
import { COUPON_MESSAGES, validateCoupon, type CouponValues } from "@/lib/domain/coupon-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export type CouponSaveResult =
  | { ok: true }
  | { ok: false; errors?: Partial<Record<keyof CouponValues, string>>; message?: string };

export async function saveCoupon(id: string | null, values: CouponValues): Promise<CouponSaveResult> {
  const check = validateCoupon(values);
  if (!check.ok) return { ok: false, errors: check.errors };
  const { supabase } = await requireAdmin();
  const { error } = id
    ? await supabase.from("coupons").update(check.payload).eq("id", id)
    : await supabase.from("coupons").insert(check.payload);
  if (error) {
    return error.code === "23505"
      ? { ok: false, errors: { code: COUPON_MESSAGES.codeTaken } }
      : { ok: false, message: SAVE_FAILED };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setCouponActive(id: string, value: boolean): Promise<ToggleResult> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("coupons").update({ is_active: value }).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/", "layout");
  return { ok: true };
}
