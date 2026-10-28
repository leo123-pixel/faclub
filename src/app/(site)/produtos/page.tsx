import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser, CatalogFromUrl } from "@/components/site/CatalogBrowser";
import { loadCatalog, loadSettings } from "@/lib/data/public";
import { contactLink } from "@/lib/domain/site-settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Produtos | FAC LUB",
  description: "Óleos, filtros e lubrificantes a pronta entrega. Busque por marca, viscosidade ou aplicação e peça pelo WhatsApp.",
};

export default async function CatalogPage() {
  const [{ categories, items }, settings] = await Promise.all([loadCatalog(), loadSettings()]);
  const props = { categories, items, contactHref: contactLink(settings) };
  return (
    <main className="mx-auto w-full max-w-[1312px] px-4 pb-[120px] pt-20 max-md:pt-12">
      <div className="text-center">
        <h1 className="font-display text-[52px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[76px]">Produtos</h1>
        <p className="mx-auto mt-6 max-w-[520px] text-[17px] leading-relaxed text-muted">
          Óleos, filtros e lubrificantes a pronta entrega. Escolha o produto e finalize pelo WhatsApp.
        </p>
      </div>
      {/* o HTML pré-gerado traz a lista toda; no navegador valem os filtros da URL */}
      <Suspense fallback={<CatalogBrowser {...props} />}>
        <CatalogFromUrl {...props} />
      </Suspense>
    </main>
  );
}
