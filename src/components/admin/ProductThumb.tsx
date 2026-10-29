import { publicImageUrl } from "@/lib/storage";
import { IconBucket } from "./icons";

/** Capa do produto na lista; sem foto, o ícone de embalagem da captura. */
export function ProductThumb({ path, name }: { path: string | null; name: string }) {
  if (path) {
    // eslint-disable-next-line @next/next/no-img-element -- miniatura de 44 px vinda do Storage
    return <img src={publicImageUrl(path)} alt={name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />;
  }
  return (
    <span role="img" aria-label="Sem foto" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-2 text-gold">
      <IconBucket />
    </span>
  );
}
