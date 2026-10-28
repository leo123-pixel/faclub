import { z } from "zod";
import { parseBRL } from "./money";

export const PRODUCT_TYPES = ["Mineral", "Semissintético", "Sintético"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type VariantValues = { label: string; price: string; promoPrice: string };
export type ImageValues = { path: string; isCover: boolean };

/** O que o formulário de produto guarda: textos como a loja digitou. */
export type ProductFormValues = {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  description: string;
  sku: string;
  stock: string;
  variants: VariantValues[];
  images: ImageValues[];
  specs: { viscosity: string; type: "" | ProductType; api: string; application: string };
  isVisible: boolean;
  isPromo: boolean;
  isFeatured: boolean;
};

/** O jsonb que `save_product` recebe. */
export type ProductPayload = {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  sku: string | null;
  stock: number;
  specs: Partial<Record<"viscosity" | "type" | "api" | "application", string>>;
  is_visible: boolean;
  is_promo: boolean;
  is_featured: boolean;
  variants: { label: string; price: number; promo_price: number | null }[];
  images: { path: string; is_cover: boolean }[];
};

export const MESSAGES = {
  required: "Campo obrigatório",
  promoBelowPrice: "O preço promocional precisa ser menor que o preço.",
  invalidNumber: "Informe um número válido.",
} as const;

export function emptyProduct(id: string): ProductFormValues {
  return {
    id,
    name: "",
    brandId: "",
    categoryId: "",
    description: "",
    sku: "",
    stock: "",
    variants: [],
    images: [],
    specs: { viscosity: "", type: "", api: "", application: "" },
    isVisible: true,
    isPromo: false,
    isFeatured: false,
  };
}

const filled = z.string().trim().min(1, MESSAGES.required);

const variant = z
  .object({ label: filled, price: z.string(), promoPrice: z.string() })
  .superRefine((v, ctx) => {
    const price = parseBRL(v.price);
    if (v.price.trim() === "") {
      ctx.addIssue({ code: "custom", path: ["price"], message: MESSAGES.required });
    } else if (price === null || price <= 0) {
      ctx.addIssue({ code: "custom", path: ["price"], message: MESSAGES.invalidNumber });
    }
    if (v.promoPrice.trim() === "") return;
    const promo = parseBRL(v.promoPrice);
    if (promo === null || promo <= 0) {
      ctx.addIssue({ code: "custom", path: ["promoPrice"], message: MESSAGES.invalidNumber });
    } else if (price !== null && promo >= price) {
      ctx.addIssue({ code: "custom", path: ["promoPrice"], message: MESSAGES.promoBelowPrice });
    }
  });

const schema = z.object({
  name: filled,
  brandId: filled,
  categoryId: filled,
  stock: z.string().refine((s) => s.trim() === "" || /^\d+$/.test(s.trim()), MESSAGES.invalidNumber),
  variants: z.array(variant).min(1, MESSAGES.required),
  images: z.array(z.object({ path: z.string(), isCover: z.boolean() })).min(1, MESSAGES.required),
  specs: z.object({ type: z.enum(["", ...PRODUCT_TYPES]) }).passthrough(),
});

export type ValidationResult =
  | { ok: true; payload: ProductPayload }
  | { ok: false; errors: Record<string, string> };

/** Valida o formulário; os erros vêm por campo (`variants.0.price`) com as mensagens da spec. */
export function validateProduct(values: ProductFormValues): ValidationResult {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }

  const specs = Object.fromEntries(
    Object.entries(values.specs).filter(([, v]) => v.trim() !== ""),
  ) as ProductPayload["specs"];

  return {
    ok: true,
    payload: {
      id: values.id,
      name: values.name.trim(),
      brand_id: values.brandId,
      category_id: values.categoryId,
      description: values.description.trim(),
      sku: values.sku.trim() || null,
      stock: values.stock.trim() === "" ? 0 : Number(values.stock),
      specs,
      is_visible: values.isVisible,
      is_promo: values.isPromo,
      is_featured: values.isFeatured,
      variants: values.variants.map((v) => ({
        label: v.label.trim(),
        price: parseBRL(v.price) as number,
        promo_price: v.promoPrice.trim() === "" ? null : parseBRL(v.promoPrice),
      })),
      images: values.images.map((i) => ({ path: i.path, is_cover: i.isCover })),
    },
  };
}
