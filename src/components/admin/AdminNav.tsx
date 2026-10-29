"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconBucket, IconGear, IconGrid, IconImage, IconList, IconMenu, IconReceipt, IconTag, IconTicket,
} from "./icons";

// Ordem do menu: captura do painel + "Pedidos" abaixo de "Produtos" (AD-007).
export const ADMIN_NAV = [
  { href: "/admin", label: "Visão geral", icon: IconGrid, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: IconBucket },
  { href: "/admin/pedidos", label: "Pedidos", icon: IconReceipt },
  { href: "/admin/categorias", label: "Categorias", icon: IconList },
  { href: "/admin/marcas", label: "Marcas", icon: IconTag },
  { href: "/admin/banners", label: "Banners e ofertas", icon: IconImage },
  { href: "/admin/cupons", label: "Cupons", icon: IconTicket },
  { href: "/admin/configuracoes", label: "Configurações", icon: IconGear },
] as const;

export function AdminNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-nav"
        className="ml-auto flex h-11 items-center gap-2 rounded-lg px-3 text-sm text-white lg:hidden"
      >
        <IconMenu /> Menu
      </button>
      <nav
        id="admin-nav"
        aria-label="Menu do painel"
        className={`${open ? "block" : "hidden"} w-full basis-full lg:block lg:basis-auto`}
      >
        <ul className="mt-2 space-y-1 lg:mt-8">
          {ADMIN_NAV.map((item) => {
            const on = active(item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] ${
                    on ? "bg-gold/15 font-semibold text-gold" : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
