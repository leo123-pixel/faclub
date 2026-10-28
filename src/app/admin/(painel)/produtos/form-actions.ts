"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SaveResult } from "@/components/admin/product-form/ProductForm";
import { validateProduct, type ProductFormValues } from "@/lib/domain/product-input";
import { isAdminUser } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";
import { NAME_TAKEN, PROMO_NEEDS_PRICE, SAVE_PRODUCT_FAILED, SESSION_EXPIRED } from "./messages";

async function adminClient() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return isAdminUser(data.user) ? supabase : null;
}

export async function saveProduct(values: ProductFormValues): Promise<SaveResult & { expired?: boolean }> {
  const supabase = await adminClient();
  if (!supabase) return { ok: false, message: SESSION_EXPIRED, expired: true };

  const check = validateProduct(values);
  if (!check.ok) return { ok: false, errors: check.errors };

  const { error } = await supabase.rpc("save_product", { p: check.payload });
  if (error) {
    return { ok: false, message: error.message.includes("promo_requires_price") ? PROMO_NEEDS_PRICE : SAVE_PRODUCT_FAILED };
  }
  revalidatePath("/", "layout");
  redirect("/admin/produtos?salvo=1");
}

export type CreateBrandResult = { ok: true; brand: { id: string; name: string } } | { ok: false; message: string };

export async function createBrand(name: string): Promise<CreateBrandResult> {
  const supabase = await adminClient();
  if (!supabase) return { ok: false, message: SESSION_EXPIRED };
  const clean = name.trim();
  if (!clean) return { ok: false, message: "Campo obrigatório" };
  const { data, error } = await supabase.from("brands").insert({ name: clean }).select("id, name").single();
  if (error) return { ok: false, message: error.code === "23505" ? NAME_TAKEN : SAVE_PRODUCT_FAILED };
  revalidatePath("/", "layout");
  return { ok: true, brand: data };
}
