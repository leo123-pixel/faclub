"use server";

import { revalidatePath } from "next/cache";
import { SAVE_FAILED, type ToggleResult } from "@/components/admin/toggle-result";
import { isOrderStatus } from "@/lib/domain/admin-orders";
import { requireAdmin } from "@/lib/supabase/admin-guard";

/** Grava o status do pedido (ORD-01 AC 2). */
export async function setOrderStatus(id: number, status: string): Promise<ToggleResult> {
  if (!isOrderStatus(status) || !Number.isInteger(id)) return { ok: false, message: SAVE_FAILED };
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, message: SAVE_FAILED };
  revalidatePath("/admin/pedidos");
  return { ok: true };
}
