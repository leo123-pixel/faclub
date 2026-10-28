"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass = "text-[14px] text-muted hover:text-ink";

/** Rodapé das capturas: completo na Home, curto nas demais páginas. */
export function SiteFooter({ instagram, area }: { instagram: string; area: string }) {
  const onHome = usePathname() === "/";
  const year = new Date().getFullYear();

  if (onHome) {
    return (
      <footer className="border-t border-line-soft">
        <div className="mx-auto flex max-w-[1232px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-faclub.png" alt="" width={32} height={32} />
            <p className="text-[14px] text-muted">© {year} FAC Lubrificantes</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {instagram && (
              <li>
                <a href={instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Instagram
                </a>
              </li>
            )}
            <li>
              <Link href="/produtos" className={linkClass}>
                Produtos
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade" className={linkClass}>
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link href="/admin" className={linkClass}>
                Área administrativa
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line-soft">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-muted">
          © {year} FAC Lubrificantes{area ? ` · ${area}` : ""}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/politica-de-privacidade" className={linkClass}>
              Política de privacidade
            </Link>
          </li>
          <li>
            <Link href="/admin" className={linkClass}>
              Área administrativa
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
