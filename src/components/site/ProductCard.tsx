"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBRL } from "@/lib/domain/money";
import { cardPrice, type CatalogItem } from "@/lib/domain/catalog";
import { CART_SOON } from "./cart-soon";
import { IconPlus } from "./icons";
import { ProductPhoto } from "./ProductPhoto";

type Layout = "catalog" | "featured" | "related";

/**
 * Card das capturas: no catálogo com o "+"; nos destaques da Home com o preço
 * ao lado da marca; em "Combine com" só com a marca.
 */
export function ProductCard({ item, layout = "catalog" }: { item: CatalogItem; layout?: Layout }) {
  const [notice, setNotice] = useState(false);
  const price = cardPrice(item);
  const href = `/produtos/${item.slug}`;
  const eyebrow = layout === "related" ? item.brandName : `${item.brandName} · ${price.label}`;
  const photoHeight = layout === "related" ? "aspect-[308/260]" : "aspect-[308/320]";

  const priceTag = (
    <p
      className={`flex text-[16px] font-semibold text-ink ${
        layout === "featured" ? "shrink-0 flex-col items-end leading-tight" : "flex-wrap items-baseline gap-x-2"
      }`}
    >
      <span>{formatBRL(price.price)}</span>
      {price.regular !== null && (
        <s className="text-[13px] font-normal text-muted">
          <span className="sr-only">de </span>
          {formatBRL(price.regular)}
        </s>
      )}
    </p>
  );

  return (
    <article className="group relative flex flex-col">
      <div className={`relative overflow-hidden rounded-[24px] ${photoHeight}`}>
        <ProductPhoto
          path={item.coverPath}
          alt={`${item.brandName} ${item.name}`}
          className="h-full w-full rounded-[24px] transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {item.isPromo && (
          <span className="absolute left-[14px] top-[14px] rounded-full bg-gold px-3 py-1 text-[13px] font-semibold text-ink">
            Oferta
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 px-1 pt-[14px]">
        <div className="min-w-0 flex-1">
          <div className={layout === "featured" ? "flex items-start justify-between gap-3" : ""}>
            <p className="truncate text-[13px] text-muted">{eyebrow}</p>
            {layout === "featured" && priceTag}
          </div>
          <h3 className="mt-0.5 font-display text-[18px] font-semibold leading-snug tracking-tight text-ink">
            {/* o link cobre o card inteiro; o "+" fica por cima */}
            <Link href={href} className="after:absolute after:inset-0 after:rounded-[24px] after:content-['']">
              {item.name}
            </Link>
          </h3>
          {layout !== "featured" && <div className="mt-1">{priceTag}</div>}
        </div>
        {layout === "catalog" && (
          <button
            type="button"
            aria-label={`Adicionar ${item.brandName} ${item.name} ao carrinho`}
            onClick={() => setNotice(true)}
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white hover:bg-navy-2"
          >
            <IconPlus />
          </button>
        )}
      </div>
      {notice && (
        <p role="status" className="relative z-10 mt-2 px-1 text-[13px] text-muted">
          {CART_SOON}
        </p>
      )}
    </article>
  );
}
