import Image from "next/image";
import type { Coupon } from "@/lib/domain/home";
import { CouponBlock } from "../CouponBlock";

/** Seção do cupom sobre a foto do mecânico; some sem cupom ativo (HOME-01 AC 14). */
export function HomeCoupon({ coupon, groupLink }: { coupon: Coupon | null; groupLink: string }) {
  if (!coupon) return null;
  return (
    <section aria-label="Cupom de desconto" className="relative m-3 mt-[100px] overflow-hidden rounded-[28px] bg-ink max-md:mt-16">
      <Image src="/images/home/mecanico.jpg" alt="Mecânico colocando óleo no motor" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[#0E1322]/88" />
      <div className="relative flex min-h-[736px] items-center justify-center px-4 py-16 max-md:min-h-0">
        <CouponBlock coupon={coupon} groupLink={groupLink} />
      </div>
    </section>
  );
}
