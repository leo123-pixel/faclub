import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { BannerForm } from "../BannerForm";

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("banners")
    .select("id, image_path, title, subtitle, link, position, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return (
    <BannerForm
      mode="editar"
      initial={{
        id: data.id,
        imagePath: data.image_path,
        title: data.title,
        subtitle: data.subtitle,
        link: data.link ?? "",
        position: String(data.position),
        isActive: data.is_active,
      }}
    />
  );
}
