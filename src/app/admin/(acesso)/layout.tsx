import type { ReactNode } from "react";

export default function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-2xl font-semibold text-white">
          FAC LUB <span className="text-gold">Painel</span>
        </p>
        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">{children}</div>
      </div>
    </main>
  );
}
