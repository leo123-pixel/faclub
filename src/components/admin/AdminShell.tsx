import Image from "next/image";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/(painel)/actions";
import { AdminNav } from "./AdminNav";

export function AdminShell({ userLabel, children }: { userLabel: string; children: ReactNode }) {
  const initial = userLabel.trim().charAt(0).toUpperCase() || "A";
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg lg:flex-row">
      <aside className="flex flex-wrap items-center bg-navy px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:shrink-0 lg:flex-col lg:flex-nowrap lg:items-stretch lg:px-4 lg:py-6">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo-faclub.png" alt="FAC LUB" width={44} height={44} priority />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold text-white">FAC LUB</p>
            <p className="text-[13px] text-gold">Painel</p>
          </div>
        </div>
        <AdminNav />
        <div className="hidden items-center gap-3 rounded-xl bg-white/5 p-3 lg:mt-auto lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-semibold text-ink">
            {initial}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{userLabel}</p>
            <form action={signOut}>
              <button type="submit" className="text-[13px] text-white/70 hover:text-white">
                Sair
              </button>
            </form>
          </div>
        </div>
        <form action={signOut} className="w-full lg:hidden">
          <button type="submit" className="mt-2 h-11 w-full rounded-xl bg-white/5 text-sm text-white">
            Sair
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
