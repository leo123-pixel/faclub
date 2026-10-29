"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clickWhatsappEvent } from "@/lib/domain/analytics-events";
import { useCart } from "./CartProvider";
import { IconBag, IconClose, IconMenu } from "./icons";
import { track } from "./track";

const LINKS = [
  { href: "/#servicos", label: "Serviços", current: () => false },
  { href: "/produtos", label: "Produtos", current: (path: string) => path === "/produtos" || path.startsWith("/produtos/") },
  { href: "/#contato", label: "Contato", current: () => false },
];

/**
 * Topo fixo de todas as páginas públicas (HEAD-01). Na Home ele fica sobre a
 * foto do topo, em branco, e ganha fundo escuro depois de rolar.
 */
export function SiteHeader({ scheduleHref }: { scheduleHref: string }) {
  const path = usePathname();
  const onHome = path === "/";
  // o menu do celular guarda a página em que foi aberto: trocar de página o fecha
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === path;
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = onHome;
  const solid = !onHome || scrolled || open;
  const linkColor = dark ? "text-white/85 hover:text-white" : "text-[#3A4157] hover:text-ink";
  const currentColor = dark ? "text-white" : "text-ink";

  return (
    <div className={onHome ? "sticky top-0 z-50 -mb-[100px] px-3 pt-3" : "sticky top-0 z-50"}>
      <header
        className={[
          "relative transition-colors",
          onHome
            ? `rounded-[28px] ${solid ? "bg-ink/95 shadow-lg backdrop-blur" : "bg-transparent"}`
            : "border-b border-line-soft bg-white",
        ].join(" ")}
      >
        <div
          className={[
            "relative mx-auto flex items-center gap-3",
            onHome ? "h-[88px] px-4 sm:px-7" : "h-20 max-w-[1312px] px-4 sm:px-6 lg:px-4",
          ].join(" ")}
        >
          <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg" aria-label="FAC LUB, página inicial">
            <Image src="/brand/logo-faclub.png" alt="" width={40} height={40} priority />
            <span className={`hidden font-display text-lg font-semibold min-[420px]:inline ${dark ? "text-white" : "text-ink"}`}>
              FAC LUB
            </span>
          </Link>

          <nav
            aria-label="Menu principal"
            className="hidden flex-1 justify-center md:flex lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <ul className="flex items-center gap-8">
              {LINKS.map((l) => {
                const current = l.current(path);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current ? "page" : undefined}
                      className={`text-[15px] ${current ? `font-semibold ${currentColor}` : `font-medium ${linkColor}`}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0 lg:ml-auto">
            <button
              type="button"
              className={`flex h-11 w-11 items-center justify-center rounded-full md:hidden ${dark ? "text-white" : "text-ink"}`}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="menu-celular"
              onClick={() => setMenuPath(open ? null : path)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
            <Link
              href="/carrinho"
              aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full ${dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-bg"}`}
            >
              <IconBag />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  data-testid="contador-carrinho"
                  className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink"
                >
                  {count}
                </span>
              )}
            </Link>
            <a
              href={scheduleHref}
              onClick={() => track(clickWhatsappEvent("topo"))}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 inline-flex h-11 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-semibold sm:px-[22px] ${
                dark ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-navy-2"
              }`}
            >
              Agendar troca
            </a>
          </div>
        </div>

        {open && (
          <nav
            id="menu-celular"
            aria-label="Menu principal"
            className={`border-t px-4 pb-4 md:hidden ${dark ? "border-white/10" : "border-line-soft"}`}
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => {
                const current = l.current(path);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current ? "page" : undefined}
                      onClick={() => setMenuPath(null)}
                      className={`flex h-12 items-center text-base ${current ? `font-semibold ${currentColor}` : `font-medium ${linkColor}`}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
}
