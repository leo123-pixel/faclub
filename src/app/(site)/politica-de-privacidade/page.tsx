import type { Metadata } from "next";
import { loadSettings } from "@/lib/data/public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Política de privacidade | FAC LUB",
  description: "Como a FAC Lubrificantes trata os dados de quem visita o site e faz pedidos pelo WhatsApp.",
};

export default async function PrivacyPage() {
  const { email } = await loadSettings();
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Política de privacidade</h1>
      <p className="mt-3 text-sm text-muted">Atualizada em 28 de outubro de 2026.</p>

      <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-[#3A4157]">
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Quem somos</h2>
          <p className="mt-3">
            Este site é da FAC Lubrificantes, loja de troca de óleo e filtros no Parque Novo Mundo, em São Paulo. Esta
            política explica quais dados o site guarda, para quê e como pedir que sejam apagados, conforme a Lei Geral
            de Proteção de Dados (LGPD).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Dados do pedido</h2>
          <p className="mt-3">
            Quando você envia um pedido pelo carrinho, guardamos os produtos, as quantidades, o total estimado, o cupom
            usado e a página de onde o pedido saiu. Seu nome e o seu veículo só são guardados se você preencher esses
            campos; os dois são opcionais. O site não pede CPF, endereço nem dados de pagamento.
          </p>
          <p className="mt-3">
            Usamos esses dados só para separar os produtos, atender você pelo WhatsApp e acompanhar os pedidos da
            loja. Não vendemos nem repassamos seus dados.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Cookies</h2>
          <p className="mt-3">
            O site usa cookies do Google Analytics 4 (GA4) para contar visitas e entender quais páginas ajudam mais, e
            do Meta Pixel para medir os anúncios da loja no Facebook e no Instagram. Esses cookies não identificam você
            pelo nome e você pode recusá-los no aviso de cookies ou apagá-los no seu navegador.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Seus direitos e contato</h2>
          <p className="mt-3">
            Você pode pedir para ver, corrigir ou apagar os dados de um pedido seu escrevendo para{" "}
            <a href={`mailto:${email}`} className="font-medium text-ink underline underline-offset-2">
              {email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
