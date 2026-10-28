import { describe, expect, it } from "vitest";
import { normalizeCouponCode, validateCoupon, type CouponValues } from "./coupon-input";

const PERCENT = "Use um número de 1 a 100.";
const values = (over: Partial<CouponValues> = {}): CouponValues => ({
  code: "FACLUB10",
  percent: "10",
  description: "10% de desconto na troca feita na loja.",
  isActive: true,
  ...over,
});

describe("cupom", () => {
  it("CUP-01.2: o código é gravado em maiúsculas e sem espaços", () => {
    expect(normalizeCouponCode(" fac club 10 ")).toBe("FACCLUB10");
    const r = validateCoupon(values({ code: " troca 15 " }));
    expect(r.ok && r.payload.code).toBe("TROCA15");
  });

  it("CUP-01.3: o percentual precisa ser inteiro de 1 a 100", () => {
    for (const percent of ["0", "101", "10,5", "10.5", "dez", "", "-5"]) {
      expect(validateCoupon(values({ percent }))).toEqual({ ok: false, errors: { percent: PERCENT } });
    }
    for (const percent of ["1", "100", " 15 "]) expect(validateCoupon(values({ percent })).ok).toBe(true);
  });

  it("código vazio mostra Campo obrigatório e o payload sai completo", () => {
    expect(validateCoupon(values({ code: "   " }))).toEqual({ ok: false, errors: { code: "Campo obrigatório" } });
    expect(validateCoupon(values({ percent: "15", isActive: false }))).toEqual({
      ok: true,
      payload: { code: "FACLUB10", percent: 15, description: "10% de desconto na troca feita na loja.", is_active: false },
    });
  });
});
