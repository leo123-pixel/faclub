"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { compressToWebp } from "@/components/admin/product-form/compress";
import { PhotoUploader, type UploadFn } from "@/components/admin/product-form/PhotoUploader";
import { Switch } from "@/components/admin/Switch";
import type { BannerValues } from "@/lib/domain/banner-input";
import { PRODUCT_BUCKET } from "@/lib/storage";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { saveBanner } from "./form-actions";

const BANNER_MAX_SIDE = 2400;
const input = "mt-1 block h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink";

const upload: UploadFn = async (blob, path) => {
  const { error } = await createBrowserSupabase()
    .storage.from(PRODUCT_BUCKET)
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  return { ok: !error };
};

export function BannerForm({ mode, initial }: { mode: "novo" | "editar"; initial: BannerValues }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerValues, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof BannerValues>(k: K, v: BannerValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await saveBanner(values);
      setErrors(res.errors ?? {});
      setMessage(res.message ?? null);
    });
  }

  const err = (k: keyof BannerValues) =>
    errors[k] && (
      <p role="alert" className="mt-1 text-sm text-low-ink">
        {errors[k]}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            <Link href="/admin/banners" className="underline">
              Banners e ofertas
            </Link>{" "}
            / {mode === "novo" ? "Novo banner" : values.title || "Editar"}
          </p>
          <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-ink lg:text-[40px]">
            {mode === "novo" ? "Novo banner" : "Editar banner"}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/banners"
            className="inline-flex h-12 items-center rounded-xl border border-line bg-white px-5 font-semibold text-ink hover:border-ink"
          >
            Cancelar
          </Link>
          <button type="submit" disabled={pending} className="h-12 rounded-xl bg-ink px-5 font-semibold text-gold disabled:opacity-60">
            {pending ? "Salvando…" : "Salvar banner"}
          </button>
        </div>
      </header>

      {message && (
        <p role="alert" className="mb-4 rounded-xl bg-low px-4 py-3 text-low-ink">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section aria-label="Conteúdo do banner" className="space-y-4 rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Foto</p>
            <p className="mb-2 text-[13px] text-muted">Foto horizontal e grande; ela ocupa o topo da Home.</p>
            <PhotoUploader
              productId=""
              folder="banners"
              max={1}
              photos={values.imagePath ? [{ id: values.imagePath, path: values.imagePath, isCover: true }] : []}
              onChange={(photos) => set("imagePath", photos[0]?.path ?? "")}
              upload={upload}
              prepare={(f) => compressToWebp(f, BANNER_MAX_SIDE)}
              error={errors.imagePath}
            />
          </div>
          <label className="block text-sm font-semibold text-ink">
            Título
            <input value={values.title} onChange={(e) => set("title", e.target.value)} className={input} />
          </label>
          {err("title")}
          <label className="block text-sm font-semibold text-ink">
            Texto
            <textarea
              value={values.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              rows={3}
              className={`${input} h-auto py-2`}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="block text-sm font-semibold text-ink">
                Link
                <input
                  value={values.link}
                  onChange={(e) => set("link", e.target.value)}
                  placeholder="/produtos"
                  className={input}
                />
              </label>
              {err("link")}
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink">
                Ordem
                <input inputMode="numeric" value={values.position} onChange={(e) => set("position", e.target.value)} className={input} />
              </label>
              {err("position")}
            </div>
          </div>
        </section>
        <section aria-label="Publicação" className="rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Publicação</h2>
          <div className="flex items-center justify-between gap-3 border-t border-line-soft pt-3">
            <div className="leading-tight">
              <p className="font-semibold text-ink">Ativo</p>
              <p className="text-[13px] text-muted">A Home mostra o banner ativo de menor ordem</p>
            </div>
            <Switch checked={values.isActive} label="Ativo" onChange={(v) => set("isActive", v)} />
          </div>
        </section>
      </div>
    </form>
  );
}
