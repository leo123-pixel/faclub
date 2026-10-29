"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { parseBRL } from "@/lib/domain/money";
import { PRODUCT_TYPES, validateProduct, type ProductFormValues } from "@/lib/domain/product-input";
import { publicImageUrl } from "@/lib/storage";
import { Switch } from "../Switch";
import { PhotoUploader, type PrepareFn, type UploadFn } from "./PhotoUploader";
import { PreviewCard } from "./PreviewCard";
import { VariantPicker } from "./VariantPicker";

export type SaveResult = { ok: true } | { ok: false; errors?: Record<string, string>; message?: string };
type Option = { id: string; name: string };
const NEW_BRAND = "__nova-marca__";

type Props = {
  mode: "novo" | "editar";
  initial: ProductFormValues;
  brands: Option[];
  categories: Option[];
  onSave: (values: ProductFormValues) => Promise<SaveResult>;
  onCancel: () => void;
  upload: UploadFn;
  prepare: PrepareFn;
  /** Com esta função, o select de marca ganha a opção "+ Nova marca". */
  onCreateBrand?: (name: string) => Promise<{ ok: true; brand: Option } | { ok: false; message: string }>;
  /** Ações extras no topo (ex.: Duplicar). */
  headerExtra?: ReactNode;
};

const field = "mt-1 block h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] outline-none focus:border-ink";
const labelCls = "block text-sm font-semibold text-ink";

function Err({ text }: { text?: string }) {
  return text ? (
    <span role="alert" className="mt-1 block text-sm font-normal text-low-ink">
      {text}
    </span>
  ) : null;
}

function Section({ title, className = "", children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={`rounded-2xl border border-line-soft bg-white p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function ProductForm(props: Props) {
  const { mode, initial, categories, onSave, onCancel, upload, prepare, onCreateBrand, headerExtra } = props;
  const [brands, setBrands] = useState(props.brands);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [newBrand, setNewBrand] = useState<string | null>(null);
  const [brandMessage, setBrandMessage] = useState<string | null>(null);
  const [creatingBrand, startCreatingBrand] = useTransition();
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const setSpec = (key: keyof ProductFormValues["specs"], value: string) =>
    setValues((v) => ({ ...v, specs: { ...v.specs, [key]: value } }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const check = validateProduct(values);
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    startSaving(async () => {
      const result = await onSave(values);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? null);
      }
    });
  }

  function createBrand() {
    if (!onCreateBrand) return;
    startCreatingBrand(async () => {
      const res = await onCreateBrand(newBrand ?? "");
      if (!res.ok) {
        setBrandMessage(res.message);
        return;
      }
      setBrands((list) => [...list, res.brand].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      set("brandId", res.brand.id);
      setNewBrand(null);
      setBrandMessage(null);
    });
  }

  function cancel() {
    if (!dirty || window.confirm("Descartar as alterações?")) onCancel();
  }

  const first = values.variants[0];
  const cover = values.images.find((i) => i.isCover);
  const brandName = brands.find((b) => b.id === values.brandId)?.name ?? "";

  return (
    <form onSubmit={submit} noValidate>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            <Link href="/admin/produtos" className="underline">
              Produtos
            </Link>{" "}
            / {mode === "novo" ? "Novo produto" : values.name || "Editar"}
          </p>
          <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-ink lg:text-[40px]">
            {mode === "novo" ? "Cadastrar produto" : "Editar produto"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {headerExtra}
          <button
            type="button"
            onClick={cancel}
            className="h-12 rounded-xl border border-line bg-white px-5 font-semibold text-ink hover:border-ink"
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="h-12 rounded-xl bg-ink px-5 font-semibold text-gold disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </header>

      {message && (
        <p role="alert" className="mb-4 rounded-xl bg-low px-4 py-3 text-low-ink">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Section title="Informações básicas" className="order-1">
          <div className="space-y-4">
            <label className={labelCls}>
              Nome do produto
              <input value={values.name} onChange={(e) => set("name", e.target.value)} className={field} />
              <Err text={errors.name} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Marca
                  <select
                    value={values.brandId}
                    onChange={(e) => (e.target.value === NEW_BRAND ? setNewBrand("") : set("brandId", e.target.value))}
                    className={field}
                  >
                    <option value="">Selecione</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    {onCreateBrand && <option value={NEW_BRAND}>+ Nova marca</option>}
                  </select>
                  <Err text={errors.brandId} />
                </label>
                {newBrand !== null && (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        aria-label="Nome da marca"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            createBrand();
                          }
                        }}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
                      />
                      <button
                        type="button"
                        disabled={creatingBrand}
                        onClick={createBrand}
                        className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-gold disabled:opacity-60"
                      >
                        Criar
                      </button>
                    </div>
                    <Err text={brandMessage ?? undefined} />
                  </div>
                )}
              </div>
              <label className={labelCls}>
                Categoria
                <select value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={field}>
                  <option value="">Selecione</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Err text={errors.categoryId} />
              </label>
            </div>
            <label className={labelCls}>
              Descrição
              <textarea
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Para que serve, em qual motor usar, diferenciais..."
                rows={4}
                className={`${field} h-auto py-2`}
              />
            </label>
          </div>
        </Section>

        {/* No celular as duas caixas da direita entram na coluna única (contents); no computador viram a coluna lateral. */}
        <div className="contents lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:flex lg:flex-col lg:gap-5">
          <Section title="Publicação" className="order-2">
            <div className="divide-y divide-line-soft border-t border-line-soft">
              {(
                [
                  ["isVisible", "Visível no site", "Aparece no catálogo"],
                  ["isPromo", "Em oferta", "Selo de oferta e preço promocional"],
                  ["isFeatured", "Destaque na home", "Entra na vitrine da página inicial"],
                ] as const
              ).map(([key, title, hint]) => (
                <div key={key} className="flex items-center justify-between gap-3 py-2">
                  <div className="leading-tight">
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-[13px] text-muted">{hint}</p>
                  </div>
                  <Switch checked={values[key]} label={title} onChange={(v) => set(key, v)} />
                </div>
              ))}
            </div>
          </Section>
          <div className="order-6">
            <PreviewCard
              brandName={brandName}
              name={values.name}
              packageLabel={first?.label ?? ""}
              price={first ? parseBRL(first.price) : null}
              promoPrice={first?.promoPrice ? parseBRL(first.promoPrice) : null}
              isPromo={values.isPromo}
              coverUrl={cover ? publicImageUrl(cover.path) : null}
            />
          </div>
        </div>


        <Section title="Fotos" className="order-3 lg:col-start-1">
          <PhotoUploader
            productId={values.id}
            photos={values.images.map((i, n) => ({ id: `${n}-${i.path}`, path: i.path, isCover: i.isCover }))}
            onChange={(photos) => set("images", photos.map(({ path, isCover }) => ({ path, isCover })))}
            upload={upload}
            prepare={prepare}
            error={errors.images}
          />
        </Section>

        <Section title="Preço e estoque" className="order-4 lg:col-start-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Estoque
              <input inputMode="numeric" value={values.stock} onChange={(e) => set("stock", e.target.value)} className={field} />
              <Err text={errors.stock} />
            </label>
            <label className={labelCls}>
              SKU / código
              <input
                value={values.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Ex.: LBX-1540-20"
                className={field}
              />
            </label>
          </div>
          <div className="mt-5">
            <VariantPicker variants={values.variants} onChange={(v) => set("variants", v)} errors={errors} />
          </div>
        </Section>

        <Section title="Ficha técnica" className="order-5 lg:col-start-1">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelCls}>
              Viscosidade
              <input value={values.specs.viscosity} onChange={(e) => setSpec("viscosity", e.target.value)} className={field} />
            </label>
            <label className={labelCls}>
              Tipo
              <select
                value={values.specs.type}
                onChange={(e) => setSpec("type", e.target.value)}
                className={field}
              >
                <option value="">Selecione</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Especificação API
              <input
                value={values.specs.api}
                onChange={(e) => setSpec("api", e.target.value)}
                placeholder="Ex.: CI-4"
                className={field}
              />
            </label>
            <label className={`${labelCls} sm:col-span-1`}>
              Aplicação
              <input
                value={values.specs.application}
                onChange={(e) => setSpec("application", e.target.value)}
                className={field}
              />
            </label>
          </div>
        </Section>
      </div>
    </form>
  );
}
