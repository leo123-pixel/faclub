import { publicImageUrl } from "@/lib/storage";

/** Marcas cadastradas: nome em cinza; logo só quando o distribuidor forneceu (site-publico, Assumptions). */
export function HomeBrands({ brands }: { brands: { name: string; logo_path: string | null }[] }) {
  if (brands.length === 0) return null;
  return (
    <section aria-labelledby="marcas-titulo" className="px-4 pb-10 pt-[110px] text-center max-md:pt-16">
      <h2
        id="marcas-titulo"
        className="mx-auto max-w-[760px] font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[52px]"
      >
        Trabalhamos com as marcas que mais rodam no Brasil
      </h2>
      <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-relaxed text-muted">
        Lubrificantes originais, com procedência, para cada tipo de motor.
      </p>
      <ul aria-label="Marcas" className="mx-auto mt-14 flex max-w-[1000px] flex-wrap items-center justify-center gap-x-14 gap-y-6">
        {brands.map((b) => (
          <li key={b.name}>
            {b.logo_path ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo da marca vindo do Storage
              <img src={publicImageUrl(b.logo_path)} alt={b.name} loading="lazy" className="h-9 w-auto" />
            ) : (
              <span className="font-display text-[26px] font-semibold tracking-tight text-[#9AA1B2]">{b.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
