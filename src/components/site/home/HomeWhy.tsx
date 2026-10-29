import Image from "next/image";
import { SectionHead } from "./SectionHead";

const REASONS = [
  {
    title: "Atendimento ágil",
    text: "Agende pelo WhatsApp e encontre o produto já separado quando chegar.",
    photo: "/images/home/oleo-no-motor.jpg",
    alt: "Óleo sendo colocado no motor",
    photoFirst: false,
  },
  {
    title: "O óleo certo para o seu motor",
    text: "Indicação pela especificação do fabricante, sem empurrar produto.",
    photo: "/images/home/oleo-dourado.jpg",
    alt: "Óleo lubrificante dourado",
    photoFirst: true,
  },
  {
    title: "Próxima troca registrada",
    text: "Etiqueta no para-brisa e lembrete no WhatsApp quando chegar a hora.",
    photo: "/images/home/motor-revisado.jpg",
    alt: "Motor revisado",
    photoFirst: false,
  },
];

export function HomeWhy() {
  return (
    <section aria-labelledby="porque-titulo" className="px-4 pt-[120px] max-md:pt-16">
      <SectionHead id="porque-titulo" title="Por que a FAC LUB" text="Um atendimento pensado para quem não pode ficar parado." />
      <ul className="mx-auto mt-9 grid max-w-[1200px] gap-4 lg:grid-cols-3">
        {REASONS.map((r) => (
          <li
            key={r.title}
            className={`flex min-h-[360px] overflow-hidden rounded-[24px] bg-bg ${r.photoFirst ? "flex-col-reverse" : "flex-col"}`}
          >
            <div className="p-6">
              <h3 className="font-display text-[22px] font-semibold tracking-tight text-ink">{r.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.text}</p>
            </div>
            <div className="relative h-[240px] shrink-0">
              <Image src={r.photo} alt={r.alt} fill sizes="(min-width: 1024px) 390px, 100vw" className="object-cover" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
