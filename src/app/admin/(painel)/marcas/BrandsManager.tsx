"use client";

import { useState, useTransition } from "react";
import { compressToWebp } from "@/components/admin/product-form/compress";
import { PhotoUploader, type UploadFn } from "@/components/admin/product-form/PhotoUploader";
import type { Photo } from "@/lib/domain/photos";
import { PRODUCT_BUCKET, publicImageUrl } from "@/lib/storage";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { countLabel, type TaxonomyResult } from "../taxonomy-messages";
import { deleteBrand, saveBrand } from "./actions";

type Brand = { id: string; name: string; logoPath: string | null; count: number };

const btn = "h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink disabled:opacity-40";

const upload: UploadFn = async (blob, path) => {
  const { error } = await createBrowserSupabase()
    .storage.from(PRODUCT_BUCKET)
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  return { ok: !error };
};

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<Photo[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(action: () => Promise<TaxonomyResult>, after?: () => void) {
    setMessage(null);
    start(async () => {
      const res = await action();
      if (res.ok) after?.();
      else setMessage(res.message);
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => saveBrand(null, name, logo[0]?.path ?? null),
            () => {
              setName("");
              setLogo([]);
              setFormKey((k) => k + 1);
            },
          );
        }}
        className="space-y-3 rounded-2xl border border-line-soft bg-white p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-semibold text-ink">
            Nova marca
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
            />
          </label>
          <button type="submit" disabled={pending} className="h-11 rounded-xl bg-ink px-5 font-semibold text-gold">
            Adicionar
          </button>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Logo (opcional)</p>
          <PhotoUploader
            key={formKey}
            productId=""
            folder="brands"
            max={1}
            photos={[]}
            onChange={setLogo}
            upload={upload}
            prepare={compressToWebp}
          />
        </div>
      </form>

      {message && (
        <p role="alert" className="rounded-xl bg-low px-4 py-3 text-low-ink">
          {message}
        </p>
      )}

      <ul aria-label="Marcas" className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-white">
        {brands.map((b) => (
          <li key={b.id} aria-label={b.name} className="flex flex-wrap items-center gap-3 px-5 py-3">
            {b.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo pequeno vindo do Storage
              <img src={publicImageUrl(b.logoPath)} alt={`Logo ${b.name}`} className="h-11 w-11 rounded-xl border border-line-soft object-contain" />
            ) : (
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg font-semibold text-muted">
                {b.name.charAt(0)}
              </span>
            )}
            {editing?.id === b.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => saveBrand(b.id, editing.name, null), () => setEditing(null));
                }}
              >
                <input
                  autoFocus
                  aria-label={`Nome de ${b.name}`}
                  value={editing.name}
                  onChange={(e) => setEditing({ id: b.id, name: e.target.value })}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
                />
                <button type="submit" className={btn}>
                  Salvar
                </button>
              </form>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{b.name}</p>
                <p className="text-[13px] text-muted">{countLabel(b.count)}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" className={btn} onClick={() => setEditing({ id: b.id, name: b.name })}>
                Renomear
              </button>
              <button
                type="button"
                className={btn}
                disabled={pending}
                onClick={() => {
                  if (window.confirm(`Excluir a marca ${b.name}?`)) run(() => deleteBrand(b.id));
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
