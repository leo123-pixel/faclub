import Image from "next/image";
import type { Coupon, Hero } from "@/lib/domain/home";
import { couponBadge } from "@/lib/domain/home";
import type { SiteSettings } from "@/lib/domain/site-settings";
import { publicImageUrl } from "@/lib/storage";
import { TrackedLink } from "../TrackedLink";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Topo da Home com o banner ativo (ou o padrão) e a faixa de horários, endereço e cupom. */
export function HomeHero({
  hero,
  coupon,
  settings,
  scheduleHref,
  street,
}: {
  hero: Hero;
  coupon: Coupon | null;
  settings: SiteSettings;
  scheduleHref: string;
  street: string;
}) {
  const facts = [
    { label: "Seg a Sex", value: settings.hoursWeekdays },
    { label: "Sábado", value: settings.hoursSaturday },
    { label: "Endereço", value: street },
  ];
  const secondary = hero.link === "/produtos" ? "Ver produtos" : "Saiba mais";

  return (
    <section className="relative m-3 overflow-hidden rounded-[28px] bg-ink text-white" aria-labelledby="topo-titulo">
      {hero.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto do banner vinda do Storage, já em WebP
        <img
          src={publicImageUrl(hero.imagePath)}
          alt={hero.title}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image
          src="/images/home/box-de-servico.jpg"
          alt="Box de serviço com carro no elevador"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E1322]/90 via-[#121829]/88 to-[#1B2134]/92" />

      <div className="relative flex min-h-[820px] flex-col px-5 pb-5 pt-[150px] max-md:min-h-0 max-md:pt-[120px]">
        <div className="mx-auto flex max-w-[900px] flex-1 flex-col items-center text-center">
          <h1
            id="topo-titulo"
            className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[92px]"
          >
            {hero.title}
          </h1>
          {hero.text && (
            <p className="mt-7 max-w-[560px] text-[17px] leading-[1.65] text-white/85 sm:text-[18px]">{hero.text}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink
              location="banner"
              href={scheduleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[54px] items-center rounded-full bg-ink px-7 text-[16px] font-semibold text-white ring-1 ring-white/5 hover:bg-navy-2"
            >
              Agendar pelo WhatsApp
            </TrackedLink>
            <a
              href={hero.link}
              {...(isExternal(hero.link) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex h-[54px] items-center rounded-full px-7 text-[16px] font-semibold text-white ring-1 ring-white/40 hover:bg-white/10"
            >
              {secondary}
            </a>
          </div>
        </div>

        <ul
          aria-label="Horários, endereço e cupom"
          className={`mt-16 grid grid-cols-1 gap-2 sm:grid-cols-2 ${coupon ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          {facts.map((f) => (
            <li key={f.label} className="rounded-[18px] bg-[#ECEDF0] px-5 py-[14px] text-ink">
              <p className="text-[13px] text-muted">{f.label}</p>
              <p className="font-display text-[20px] font-semibold tracking-tight">{f.value}</p>
            </li>
          ))}
          {coupon && (
            <li className="rounded-[18px] bg-gold px-5 py-[14px] text-ink">
              <p className="text-[13px] text-[#5A4410]">Cupom de desconto</p>
              <p className="font-display text-[20px] font-semibold tracking-tight">{couponBadge(coupon)}</p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
