import { darkButton, SectionHead } from "./SectionHead";

// Os seis serviços ficam no código (painel-conteudo, Out of Scope); sem foto
// até a sessão de fotos, no fundo escuro da captura.
const SERVICES = [
  { title: "Troca de óleo de motor", text: "Óleo certo, nível conferido e próxima troca registrada." },
  { title: "Óleo de câmbio", text: "Protege as engrenagens contra desgaste e corrosão." },
  { title: "Filtros", text: "Óleo, ar, combustível e ar-condicionado da cabine." },
  { title: "Linha pesada", text: "Lubrificantes e filtros para caminhões e motores diesel." },
  { title: "Aditivos, graxas e direção", text: "Complementos que ajudam no desempenho do dia a dia." },
  { title: "Lubrificante industrial", text: "Menos atrito e mais segurança de operação para empresas." },
];

export function HomeServices({ budgetHref }: { budgetHref: string }) {
  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="scroll-mt-28 px-4 pt-[100px] max-md:pt-16">
      <SectionHead
        id="servicos-titulo"
        title="Nossos serviços"
        text="Do carro do dia a dia ao caminhão, cada serviço com o produto certo."
        action={
          <a href={budgetHref} target="_blank" rel="noopener noreferrer" className={darkButton}>
            Pedir orçamento
          </a>
        }
      />
      <ul className="mx-auto mt-12 grid max-w-[1200px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <li
            key={s.title}
            className="flex min-h-[340px] flex-col justify-end rounded-[24px] bg-gradient-to-b from-[#1E2336] to-[#0D1220] p-[22px] text-white max-sm:min-h-[220px]"
          >
            <h3 className="font-display text-[22px] font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/80">{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
