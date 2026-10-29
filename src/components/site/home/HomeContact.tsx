import { onlyDigits } from "@/lib/domain/settings-input";
import type { SiteSettings } from "@/lib/domain/site-settings";
import { MapEmbed } from "../MapEmbed";
import { TrackedLink } from "../TrackedLink";
import { darkButton } from "./SectionHead";

/** "Passa aqui na FAC LUB" (HOME-01 AC 8 e 9): dados das configurações e o mapa. */
export function HomeContact({
  settings,
  address,
  contactHref,
}: {
  settings: SiteSettings;
  address: { street: string; area: string };
  contactHref: string;
}) {
  const label = "text-[13px] text-muted";
  const value = "mt-1 text-[16px] leading-relaxed text-ink";
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="scroll-mt-28 px-4 py-[120px] max-md:py-16">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-6">
        <div>
          <h2
            id="contato-titulo"
            className="max-w-[440px] font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-ink sm:text-[56px]"
          >
            Passa aqui na FAC LUB
          </h2>
          <dl className="mt-10 grid gap-x-[31px] gap-y-6 sm:grid-cols-[max-content_max-content]">
            <div>
              <dt className={label}>Endereço</dt>
              <dd className={value}>
                {address.street}
                {address.area && (
                  <>
                    <br />
                    {address.area}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className={label}>Horário</dt>
              <dd className={value}>
                Seg a Sex, {settings.hoursWeekdays}
                <br />
                Sábado, {settings.hoursSaturday}
              </dd>
            </div>
            <div>
              <dt className={label}>Telefone</dt>
              <dd className={value}>
                <a href={`tel:+55${onlyDigits(settings.phone)}`} className="hover:underline">
                  {settings.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>E-mail</dt>
              <dd className={value}>
                <a href={`mailto:${settings.email}`} className="underline underline-offset-2 [overflow-wrap:anywhere]">
                  {settings.email}
                </a>
              </dd>
            </div>
          </dl>
          <TrackedLink
            location="contato"
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${darkButton} mt-8 h-[52px] px-7 text-[16px]`}
          >
            Chamar no WhatsApp
          </TrackedLink>
        </div>
        <MapEmbed address={settings.address} />
      </div>
    </section>
  );
}
