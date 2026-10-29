"use client";

import { useState } from "react";
import { IconBucket } from "@/components/admin/icons";
import { publicImageUrl } from "@/lib/storage";

/**
 * Foto de produto do Storage. Sem foto, ou quando ela não carrega, mostra a
 * imagem neutra com o ícone de embalagem (site-publico, Edge Cases).
 */
export function ProductPhoto({
  path,
  alt,
  className = "",
  eager = false,
}: {
  path: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!path || failed === path) {
    return (
      <span role="img" aria-label={`Sem foto: ${alt}`} className={`flex items-center justify-center bg-bg text-[#A3ABBE] ${className}`}>
        <IconBucket width={56} height={56} strokeWidth={1.2} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- as fotos já chegam em WebP de até 1600 px pelo painel (design)
    <img
      src={publicImageUrl(path)}
      alt={alt}
      width={1200}
      height={1200}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(path)}
      className={`bg-bg object-cover ${className}`}
    />
  );
}
