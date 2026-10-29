import { MESSAGES } from "./product-input";

export const COUPON_MESSAGES = {
  percent: "Use um número de 1 a 100.",
  codeTaken: "Já existe um cupom com esse código.",
} as const;

export type CouponValues = { code: string; percent: string; description: string; isActive: boolean };
export type CouponPayload = { code: string; percent: number; description: string; is_active: boolean };

/** "fac club 10" vira "FACCLUB10". */
export const normalizeCouponCode = (code: string) => code.toUpperCase().replace(/\s/g, "");

export function validateCoupon(
  v: CouponValues,
): { ok: true; payload: CouponPayload } | { ok: false; errors: Partial<Record<keyof CouponValues, string>> } {
  const errors: Partial<Record<keyof CouponValues, string>> = {};
  const code = normalizeCouponCode(v.code);
  const percentText = v.percent.trim();
  const percent = /^\d+$/.test(percentText) ? Number(percentText) : NaN;
  if (!code) errors.code = MESSAGES.required;
  if (!(percent >= 1 && percent <= 100)) errors.percent = COUPON_MESSAGES.percent;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, payload: { code, percent, description: v.description.trim(), is_active: v.isActive } };
}
