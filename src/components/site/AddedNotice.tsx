import Link from "next/link";

/** Confirmação depois de adicionar (CART-01 AC 1). */
export function AddedNotice({ className = "" }: { className?: string }) {
  return (
    <p role="status" className={`flex flex-wrap items-center gap-x-2 text-[14px] text-ink ${className}`}>
      <span className="font-semibold text-ok">Adicionado ao carrinho</span>
      <Link href="/carrinho" className="font-semibold underline underline-offset-2">
        Ver carrinho
      </Link>
    </p>
  );
}
