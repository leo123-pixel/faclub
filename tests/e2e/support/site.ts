import { APP_URL, REVALIDATE_SECRET } from "../../../scripts/local-supabase/config.mjs";
import { seed } from "./seed";

/**
 * As páginas do site são geradas no build, antes do seed; revalidar faz a
 * próxima visita ler o banco de novo.
 */
export async function refreshSite() {
  const res = await fetch(`${APP_URL}/api/revalidar`, {
    method: "POST",
    headers: { authorization: `Bearer ${REVALIDATE_SECRET}` },
  });
  if (!res.ok) throw new Error(`revalidar respondeu ${res.status}`);
}

/** Dados do site público (12 produtos visíveis, um oculto, banner) e páginas revalidadas. */
export async function seedSite() {
  await seed({ site: true });
  await refreshSite();
}
