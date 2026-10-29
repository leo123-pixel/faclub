import Link from "next/link";
import type { CatalogItem } from "@/lib/domain/catalog";
import { ProductCard } from "../ProductCard";
import { darkButton, SectionHead } from "./SectionHead";

/** Até 4 destaques visíveis; sem nenhum, a seção some (HOME-01 AC 5). */
export function HomeFeatured({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="destaques-titulo" className="px-4 pt-[120px] max-md:pt-16">
      <SectionHead
        id="destaques-titulo"
        title="Produtos em destaque"
        text="Pronta entrega na loja. Peça pelo WhatsApp e retire ou faça a troca aqui."
        action={
          <Link href="/produtos" className={darkButton}>
            Ver todos
          </Link>
        }
      />
      <ul aria-label="Produtos em destaque" className="mx-auto mt-12 grid max-w-[1200px] grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <ProductCard item={item} layout="featured" />
          </li>
        ))}
      </ul>
    </section>
  );
}
