"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { RowToggle } from "@/components/admin/RowToggle";
import { publicImageUrl } from "@/lib/storage";
import { deleteBanner, setBannerActive } from "./actions";

export type BannerRow = { id: string; imagePath: string; title: string; subtitle: string; position: number; isActive: boolean };

const btn = "inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink";

export function BannersList({ banners }: { banners: BannerRow[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove(id: string) {
    if (!window.confirm("Excluir este banner?")) return;
    setMessage(null);
    start(async () => {
      const res = await deleteBanner(id);
      if (!res.ok) setMessage(res.message);
    });
  }

  return (
    <>
      {message && (
        <p role="alert" className="mb-4 rounded-xl bg-low px-4 py-3 text-low-ink">
          {message}
        </p>
      )}
      <ul aria-label="Banners" className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-white">
        {banners.map((b) => (
          <li key={b.id} aria-label={b.title} className="flex flex-wrap items-center gap-4 px-5 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- miniatura do Storage */}
            <img src={publicImageUrl(b.imagePath)} alt={`Foto do banner ${b.title}`} className="h-16 w-28 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{b.title}</p>
              {b.subtitle && <p className="text-[13px] text-muted">{b.subtitle}</p>}
              <p className="text-[13px] text-muted">Ordem {b.position}</p>
            </div>
            <span className="flex items-center gap-2 text-sm text-muted">
              Ativo
              <RowToggle
                key={`${b.id}-${b.isActive}`}
                initial={b.isActive}
                label={`Ativo: ${b.title}`}
                action={setBannerActive.bind(null, b.id)}
              />
            </span>
            <Link href={`/admin/banners/${b.id}`} className={btn}>
              Editar
            </Link>
            <button type="button" disabled={pending} onClick={() => remove(b.id)} className={btn}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
