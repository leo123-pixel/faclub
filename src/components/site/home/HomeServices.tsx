import Image from "next/image";
import { TrackedLink } from "../TrackedLink";
import { darkButton, SectionHead } from "./SectionHead";

// Os seis serviços ficam no código (painel-conteudo, Out of Scope). Fotos de
// banco com licença livre até a sessão de fotos da loja (créditos em
// public/images/servicos/CREDITOS.md).
const SERVICES = [
  {
    title: "Troca de óleo de motor",
    text: "Óleo certo, nível conferido e próxima troca registrada.",
    photo: "/images/servicos/troca-de-oleo.webp",
    alt: "Óleo sendo colocado no motor de um carro",
  },
  {
    title: "Óleo de câmbio",
    text: "Protege as engrenagens contra desgaste e corrosão.",
    photo: "/images/servicos/oleo-de-cambio.webp",
    alt: "Engrenagens de uma caixa de câmbio",
  },
  {
    title: "Filtros",
    text: "Óleo, ar, combustível e ar-condicionado da cabine.",
    photo: "/images/servicos/filtros.webp",
    alt: "Filtro de ar instalado no motor",
  },
  {
    title: "Linha pesada",
    text: "Lubrificantes e filtros para caminhões e motores diesel.",
    photo: "/images/servicos/linha-pesada.webp",
    alt: "Caminhão na estrada",
  },
  {
    title: "Aditivos, graxas e direção",
    text: "Complementos que ajudam no desempenho do dia a dia.",
    photo: "/images/servicos/aditivos-graxas.webp",
    alt: "Lubrificante escorrendo de um bico de metal",
  },
  {
    title: "Lubrificante industrial",
    text: "Menos atrito e mais segurança de operação para empresas.",
    photo: "/images/servicos/lubrificante-industrial.webp",
    alt: "Engrenagens de uma máquina industrial",
  },
];

export function HomeServices({ budgetHref }: { budgetHref: string }) {
  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="scroll-mt-28 px-4 pt-[70px] max-md:pt-16">
      <SectionHead
        id="servicos-titulo"
        title="Nossos serviços"
        text="Do carro do dia a dia ao caminhão, cada serviço com o produto certo."
        action={
          <TrackedLink location="servicos" href={budgetHref} target="_blank" rel="noopener noreferrer" className={darkButton}>
            Pedir orçamento
          </TrackedLink>
        }
      />
      <ul className="mx-auto mt-12 grid max-w-[1200px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <li
            key={s.title}
            className="relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[24px] bg-gradient-to-b from-[#1E2336] to-[#0D1220] p-[22px] text-white max-sm:min-h-[220px]"
          >
            <Image
              src={s.photo}
              alt={s.alt}
              fill
              sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
              className="-z-10 object-cover"
            />
            {/* escurece o pé da foto para o texto branco ficar legível */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/30 to-[#0D1220]/95" />
            <h3 className="font-display text-[22px] font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/85">{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
