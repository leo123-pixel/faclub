"use client";

import { useEffect } from "react";
import type { VariantRow } from "@/lib/domain/admin-products";
import { viewItemEvent } from "@/lib/domain/analytics-events";
import { track } from "./track";

/** `view_item` ao abrir a página do produto (CONS-01 AC 5). */
export function TrackViewItem({ product }: { product: { id: string; name: string; brandName: string; isPromo: boolean; variants: VariantRow[] } }) {
  useEffect(() => {
    track(viewItemEvent(product));
    // um evento por produto aberto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
