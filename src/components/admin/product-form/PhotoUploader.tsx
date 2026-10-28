"use client";

import { useRef, useState } from "react";
import { acceptPhoto, MAX_PHOTOS, setCover, withNewPhoto, withoutPhoto, withValidCover, type Photo } from "@/lib/domain/photos";
import { publicImageUrl } from "@/lib/storage";

export type UploadFn = (blob: Blob, path: string) => Promise<{ ok: boolean }>;
export type PrepareFn = (file: File) => Promise<Blob>;

type Item = Photo & { status: "ok" | "uploading" | "failed"; failed?: boolean; preview?: string; blob?: Blob };

type Props = {
  productId: string;
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  upload: UploadFn;
  prepare: PrepareFn;
  /** Pasta no bucket; produtos usam products/<id>. */
  folder?: string;
  max?: number;
  error?: string;
};

const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));

export function PhotoUploader({ productId, photos, onChange, upload, prepare, folder, max = MAX_PHOTOS, error }: Props) {
  const [items, setItems] = useState<Item[]>(photos.map((p) => ({ ...p, status: "ok" })));
  const [message, setMessage] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dir = folder ?? `products/${productId}`;

  // Só as fotos já enviadas valem para o produto, e a capa nunca fica numa que falhou.
  function commit(next: Item[]) {
    const fixed = withValidCover(next.map((i) => ({ ...i, failed: i.status === "failed" })));
    setItems(fixed);
    onChange(fixed.filter((i) => i.status === "ok").map(({ id, path, isCover }) => ({ id, path, isCover })));
  }

  async function send(item: Item, current: Item[]) {
    let ok = false;
    try {
      ok = (await upload(item.blob!, item.path)).ok;
    } catch {
      ok = false;
    }
    return current.map((i) => (i.id === item.id ? { ...i, status: ok ? ("ok" as const) : ("failed" as const) } : i));
  }

  async function addFiles(files: FileList | File[]) {
    setMessage(null);
    // Com uma foto só (logo), a nova troca a anterior.
    let current = max === 1 ? [] : items;
    for (const file of Array.from(files).slice(0, max === 1 ? 1 : undefined)) {
      const check = acceptPhoto(file, current.length, max);
      if (!check.ok) {
        setMessage(check.message);
        continue;
      }
      const id = newId();
      let blob: Blob;
      try {
        blob = await prepare(file);
      } catch {
        setMessage("Não foi possível ler esta foto. Envie em JPG ou PNG.");
        continue;
      }
      const preview = typeof URL.createObjectURL === "function" ? URL.createObjectURL(blob) : undefined;
      const item: Item = { id, path: `${dir}/${id}.webp`, isCover: false, status: "uploading", preview, blob };
      current = withNewPhoto(current, item) as Item[];
      setItems(current);
      current = await send(current.find((i) => i.id === id)!, current);
      commit(current);
    }
  }

  async function retry(id: string) {
    const item = items.find((i) => i.id === id)!;
    const pending = items.map((i) => (i.id === id ? { ...i, status: "uploading" as const } : i));
    setItems(pending);
    commit(await send(item, pending));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void addFiles(e.dataTransfer.files);
          }}
          className="flex h-[168px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-bg px-4 text-center text-[14px] text-muted sm:w-[280px]"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" aria-hidden>
            <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span>
            <strong className="text-ink">Arraste as fotos</strong> ou clique para enviar
          </span>
          <span>JPG ou PNG, fundo claro de preferência</span>
          <input
            ref={input}
            type="file"
            multiple={max > 1}
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            aria-label="Enviar fotos"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {items.map((item, index) => (
          <figure
            key={item.id}
            aria-label={`Foto ${index + 1}`}
            className="group relative h-[168px] w-[134px] overflow-hidden rounded-xl bg-navy-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- prévia local ou foto do Storage */}
            <img
              src={item.preview ?? publicImageUrl(item.path)}
              alt=""
              className="h-full w-full object-cover"
            />
            {item.isCover && (
              <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[12px] font-semibold text-ink">
                Capa
              </span>
            )}
            {item.status === "uploading" && (
              <span className="absolute inset-0 flex items-center justify-center bg-navy/60 text-sm text-white">Enviando…</span>
            )}
            {item.status === "failed" ? (
              <button
                type="button"
                onClick={() => void retry(item.id)}
                className="absolute inset-0 flex items-center justify-center bg-low/95 px-2 text-center text-sm font-semibold text-low-ink"
              >
                Falhou · tentar de novo
              </button>
            ) : (
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-navy/90 p-2 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                {!item.isCover && (
                  <button
                    type="button"
                    onClick={() => commit(setCover(items, item.id) as Item[])}
                    className="rounded-md bg-white/90 px-2 py-1 text-[12px] font-semibold text-ink"
                  >
                    Usar como capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => commit(withoutPhoto(items, item.id) as Item[])}
                  className="rounded-md bg-white/20 px-2 py-1 text-[12px] font-semibold text-white"
                >
                  Remover
                </button>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {(message ?? error) && (
        <p role="alert" className="mt-2 text-sm text-low-ink">
          {message ?? error}
        </p>
      )}
    </div>
  );
}
