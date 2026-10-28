"use client";

import { useState } from "react";
import type { VariantValues } from "@/lib/domain/product-input";

export const PACKAGES = ["Frasco 1L", "Frasco 4L", "Balde 20L", "Tambor 200L", "Unidade"];

type Props = {
  variants: VariantValues[];
  onChange: (variants: VariantValues[]) => void;
  errors?: Record<string, string>;
};

const input =
  "mt-1 block h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink";

/** Chips de embalagem; cada embalagem marcada ganha Preço e Preço promocional (AD-003). */
export function VariantPicker({ variants, onChange, errors = {} }: Props) {
  const [other, setOther] = useState<string | null>(null);
  const labels = variants.map((v) => v.label);
  const chips = [...PACKAGES, ...labels.filter((l) => !PACKAGES.includes(l))];

  function toggle(label: string) {
    if (labels.includes(label)) onChange(variants.filter((v) => v.label !== label));
    else onChange([...variants, { label, price: "", promoPrice: "" }]);
  }

  function update(index: number, field: "price" | "promoPrice", value: string) {
    onChange(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function addOther() {
    const label = (other ?? "").trim();
    if (label && !labels.includes(label)) onChange([...variants, { label, price: "", promoPrice: "" }]);
    setOther(null);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">Embalagens disponíveis</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((label) => {
          const on = labels.includes(label);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(label)}
              className={`h-10 rounded-full border px-4 text-sm font-semibold ${
                on ? "border-ink bg-ink text-gold" : "border-line bg-white text-ink"
              }`}
            >
              {on && <span aria-hidden>✓ </span>}
              {label}
            </button>
          );
        })}
        {other === null ? (
          <button
            type="button"
            onClick={() => setOther("")}
            className="h-10 rounded-full border border-dashed border-line px-4 text-sm font-semibold text-muted"
          >
            Outra
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <input
              autoFocus
              aria-label="Nome da embalagem"
              placeholder="Ex.: Pote 500g"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOther();
                }
              }}
              className="h-10 w-40 rounded-full border border-line px-4 text-sm outline-none focus:border-ink"
            />
            <button type="button" onClick={addOther} className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-gold">
              Adicionar
            </button>
          </span>
        )}
      </div>
      {errors.variants && (
        <p role="alert" className="mt-2 text-sm text-low-ink">
          {errors.variants}
        </p>
      )}

      {variants.length > 0 && (
        <div className="mt-4 space-y-3">
          {variants.map((v, i) => (
            <fieldset key={v.label} className="rounded-xl border border-line-soft p-3">
              <legend className="px-1 text-sm font-semibold text-ink">{v.label}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-ink">
                  Preço (R$)
                  <input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={v.price}
                    onChange={(e) => update(i, "price", e.target.value)}
                    className={input}
                  />
                  {errors[`variants.${i}.price`] && (
                    <span role="alert" className="mt-1 block text-sm font-normal text-low-ink">
                      {errors[`variants.${i}.price`]}
                    </span>
                  )}
                </label>
                <label className="block text-sm font-semibold text-ink">
                  Preço promocional (R$)
                  <input
                    inputMode="decimal"
                    placeholder="Opcional"
                    value={v.promoPrice}
                    onChange={(e) => update(i, "promoPrice", e.target.value)}
                    className={input}
                  />
                  {errors[`variants.${i}.promoPrice`] && (
                    <span role="alert" className="mt-1 block text-sm font-normal text-low-ink">
                      {errors[`variants.${i}.promoPrice`]}
                    </span>
                  )}
                </label>
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
