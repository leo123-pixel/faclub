import { formatBRL } from "@/lib/domain/money";
import { IconBucket } from "../icons";

type Props = {
  brandName: string;
  name: string;
  packageLabel: string;
  price: number | null;
  promoPrice: number | null;
  isPromo: boolean;
  coverUrl?: string | null;
};

/** Prévia do card como aparece no site; o preço promocional só vale com a oferta ligada. */
export function PreviewCard({ brandName, name, packageLabel, price, promoPrice, isPromo, coverUrl }: Props) {
  const promo = isPromo && promoPrice !== null;
  return (
    <section aria-label="Prévia no site" className="rounded-2xl bg-ink p-5">
      <p className="mb-4 text-sm text-white/75">Prévia no site</p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-2">
        <div className="relative flex h-[180px] items-center justify-center text-gold">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local do formulário
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <IconBucket width={64} height={64} strokeWidth={1.2} />
          )}
          {isPromo && (
            <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-0.5 text-[13px] font-semibold text-ink">
              Oferta
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-[13px] text-white/60">{brandName || "Marca"}</p>
          <p className="font-display text-lg font-semibold text-white">{name || "Nome do produto"}</p>
          <p className="text-sm text-white/60">{packageLabel || "Embalagem"}</p>
          <p className="pt-1 font-display text-xl font-bold text-gold">
            {promo ? formatBRL(promoPrice) : price !== null ? formatBRL(price) : "R$ —"}
            {promo && price !== null && (
              <s className="ml-2 text-sm font-normal text-white/50">{formatBRL(price)}</s>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
