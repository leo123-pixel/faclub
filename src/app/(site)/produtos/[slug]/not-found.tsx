import Link from "next/link";

/** Slug inexistente ou produto oculto (PDP-01 AC 2). */
export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center px-4 py-32 text-center">
      <h1 className="font-display text-[40px] font-semibold tracking-[-0.04em] text-ink">Produto não encontrado.</h1>
      <p className="mt-3 text-[17px] text-muted">Ele pode ter saído do catálogo.</p>
      <Link
        href="/produtos"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-white hover:bg-navy-2"
      >
        Ver todos os produtos
      </Link>
    </main>
  );
}
