"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { compressToWebp } from "@/components/admin/product-form/compress";
import { ProductForm } from "@/components/admin/product-form/ProductForm";
import type { UploadFn } from "@/components/admin/product-form/PhotoUploader";
import type { ProductFormValues } from "@/lib/domain/product-input";
import { PRODUCT_BUCKET } from "@/lib/storage";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { createBrand, saveProduct } from "./form-actions";

type Option = { id: string; name: string };

const draftKey = (id: string) => `faclub:rascunho:${id}`;

const upload: UploadFn = async (blob, path) => {
  const { error } = await createBrowserSupabase()
    .storage.from(PRODUCT_BUCKET)
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  return { ok: !error };
};

function readDraft(id: string): ProductFormValues | null {
  try {
    const raw = sessionStorage.getItem(draftKey(id));
    sessionStorage.removeItem(draftKey(id));
    return raw ? (JSON.parse(raw) as ProductFormValues) : null;
  } catch {
    return null;
  }
}

export function ProductEditor(props: {
  mode: "novo" | "editar";
  initial: ProductFormValues;
  brands: Option[];
  categories: Option[];
  headerExtra?: ReactNode;
}) {
  const router = useRouter();
  // Volta ao rascunho guardado quando a sessão expirou no meio da edição.
  const [initial] = useState(() => (typeof window === "undefined" ? null : readDraft(props.initial.id)) ?? props.initial);

  return (
    <ProductForm
      {...props}
      initial={initial}
      upload={upload}
      prepare={compressToWebp}
      onCancel={() => router.push("/admin/produtos")}
      onSave={async (values) => {
        const result = await saveProduct(values);
        if (!result.ok && result.expired) {
          try {
            sessionStorage.setItem(draftKey(values.id), JSON.stringify(values));
          } catch {
            // sem sessionStorage o rascunho se perde
          }
          router.push(`/admin/login?volta=${encodeURIComponent(location.pathname + location.search)}`);
        }
        return result;
      }}
      onCreateBrand={createBrand}
    />
  );
}
