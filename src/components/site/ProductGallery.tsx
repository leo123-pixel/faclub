"use client";

import { useState } from "react";
import { ProductPhoto } from "./ProductPhoto";

/** Foto grande e miniaturas (PDP-01 AC 3); a miniatura escolhida ganha a borda escura. */
export function ProductGallery({ images, alt, promo }: { images: string[]; alt: string; promo: boolean }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? null;

  return (
    <div>
      <div className="relative aspect-[686/600] overflow-hidden rounded-[24px]">
        <ProductPhoto path={current} alt={alt} eager className="h-full w-full rounded-[24px]" />
        {promo && (
          <span className="absolute left-[18px] top-[18px] rounded-full bg-gold px-[14px] py-[6px] text-[13px] font-semibold text-ink">
            Oferta da semana
          </span>
        )}
      </div>
      {images.length > 1 && (
        <ul aria-label="Fotos do produto" className="mt-3 grid grid-cols-4 gap-3">
          {images.map((path, i) => (
            <li key={path}>
              <button
                type="button"
                aria-label={`Foto ${i + 1} de ${images.length}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`block aspect-[160/110] w-full overflow-hidden rounded-[16px] border-2 ${
                  i === index ? "border-ink" : "border-transparent hover:border-line"
                }`}
              >
                <ProductPhoto path={path} alt="" className="h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
