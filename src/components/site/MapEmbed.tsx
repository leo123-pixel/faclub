import { IconPin } from "./icons";

/** Mapa do Google com o endereço das configurações; o iframe só carrega perto da tela (RF09, meta de LCP). */
export function MapEmbed({ address }: { address: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[#EEEFF3] lg:min-h-[420px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink" aria-hidden="true">
        <IconPin />
        <span className="text-[14px] text-muted">Carregando o mapa…</span>
      </div>
      <iframe
        title={`Mapa: ${address}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
