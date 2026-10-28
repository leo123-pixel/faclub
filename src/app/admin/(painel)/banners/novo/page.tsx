import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { BannerForm } from "../BannerForm";

export default async function NewBannerPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("position").order("position", { ascending: false }).limit(1);
  const next = (data?.[0]?.position ?? 0) + 1;
  return (
    <BannerForm
      mode="novo"
      initial={{ id: randomUUID(), imagePath: "", title: "", subtitle: "", link: "", position: String(next), isActive: true }}
    />
  );
}
