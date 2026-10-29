import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { BannersList } from "./BannersList";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BannersPage({ searchParams }: PageProps<"/admin/banners">) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("banners")
    .select("id, image_path, title, subtitle, position, is_active")
    .order("position")
    .order("created_at");
  if (error) throw error;
  const banners = data.map((b) => ({
    id: b.id as string,
    imagePath: b.image_path as string,
    title: b.title as string,
    subtitle: b.subtitle as string,
    position: b.position as number,
    isActive: b.is_active as boolean,
  }));
  const newButton = (
    <Link href="/admin/banners/novo" className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-gold">
      <span aria-hidden>+</span> Novo banner
    </Link>
  );

  return (
    <>
      <PageHeader eyebrow="Home" title="Banners e ofertas" actions={newButton} />
      {one(sp.salvo) === "1" && (
        <p role="status" className="mb-4 rounded-xl bg-ok/10 px-4 py-3 font-semibold text-ok">
          Banner salvo.
        </p>
      )}
      {banners.length === 0 ? (
        <p className="rounded-2xl border border-line-soft bg-white p-8 text-center text-muted">
          Nenhum banner cadastrado ainda. Sem banner ativo, a Home mostra o topo padrão.
        </p>
      ) : (
        <BannersList banners={banners} />
      )}
    </>
  );
}
