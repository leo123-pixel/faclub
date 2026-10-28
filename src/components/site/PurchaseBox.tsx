"use client";

import { useState } from "react";
import type { VariantRow } from "@/lib/domain/admin-products";
import { variantPrice } from "@/lib/domain/catalog";
import { formatBRL } from "@/lib/domain/money";
import { chipOrder, packageCaption } from "@/lib/domain/product-page";
import { AddedNotice } from "./AddedNotice";
import { useCart } from "./CartProvider";
import { IconMinus, IconPlus } from "./icons";

export const MIN_QTY = 1;
export const MAX_QTY = 99;

export type PurchaseProduct = { id: string; slug: string; title: string };

/**
 * Embalagem, preço e quantidade (PDP-01 AC 4 a 6 e 14). Abre com a primeira
 * embalagem do cadastro; os chips vão do menor ao maior. "Adicionar ao
 * carrinho" põe a embalagem e a quantidade escolhidas (CART-01 AC 1).
 */
export function PurchaseBox({ product, variants, isPromo }: { product: PurchaseProduct; variants: VariantRow[]; isPromo: boolean }) {
  const [label, setLabel] = useState(variants[0]?.label ?? "");
  const [qty, setQty] = useState(MIN_QTY);
  const [notice, setNotice] = useState(false);
  const { add } = useCart();
  const selected = variants.find((v) => v.label === label) ?? variants[0];
  if (!selected) return null;
  const price = variantPrice(isPromo, selected);

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-[44px] font-semibold leading-none tracking-[-0.04em] text-ink" aria-live="polite">
          {formatBRL(price.price)}
        </p>
        {price.regular !== null && (
          <s className="text-[18px] text-muted">
            <span className="sr-only">de </span>
            {formatBRL(price.regular)}
          </s>
        )}
        <p className="text-[15px] text-muted">{packageCaption(selected.label)}</p>
      </div>

      <div className="mt-8">
        <p id="embalagem" className="text-[14px] font-semibold text-ink">
          Embalagem
        </p>
        <div role="group" aria-labelledby="embalagem" className="mt-3 flex flex-wrap gap-2">
          {chipOrder(variants).map((v) => {
            const active = v.label === selected.label;
            return (
              <button
                key={v.label}
                type="button"
                aria-pressed={active}
                onClick={() => setLabel(v.label)}
                className={`h-11 rounded-full border px-5 text-[15px] font-medium transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-line-soft text-ink hover:border-ink"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-[10px]">
        <div className="flex h-[54px] shrink-0 items-center rounded-full border border-line-soft px-1">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={qty <= MIN_QTY}
            onClick={() => setQty((q) => Math.max(MIN_QTY, q - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-bg disabled:text-line"
          >
            <IconMinus />
          </button>
          <output aria-label="Quantidade" aria-live="polite" className="w-9 text-center text-[17px] font-semibold text-ink">
            {qty}
          </output>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={qty >= MAX_QTY}
            onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-bg disabled:text-line"
          >
            <IconPlus />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            add({ productId: product.id, slug: product.slug, title: product.title, label: selected.label, qty });
            setNotice(true);
          }}
          className="h-[54px] flex-1 rounded-full bg-ink px-6 text-[16px] font-semibold text-white hover:bg-navy-2"
        >
          Adicionar ao carrinho
        </button>
      </div>
      {notice && <AddedNotice className="mt-3" />}
    </div>
  );
}
