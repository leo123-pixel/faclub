import { MESSAGES } from "./product-input";

export const BANNER_LINK_MESSAGE = "Use um link do site (começando com /) ou um endereço completo.";

export type BannerValues = {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
  link: string;
  position: string;
  isActive: boolean;
};

export type BannerPayload = {
  id: string;
  image_path: string;
  title: string;
  subtitle: string;
  link: string | null;
  position: number;
  is_active: boolean;
};

/** Caminho do próprio site ("/produtos") ou endereço completo com http(s). */
const validLink = (link: string) => /^\/(?!\/)/.test(link) || /^https?:\/\/\S/.test(link);

export function validateBanner(
  v: BannerValues,
): { ok: true; payload: BannerPayload } | { ok: false; errors: Partial<Record<keyof BannerValues, string>> } {
  const errors: Partial<Record<keyof BannerValues, string>> = {};
  const link = v.link.trim();
  const position = v.position.trim();
  if (!v.imagePath) errors.imagePath = MESSAGES.required;
  if (!v.title.trim()) errors.title = MESSAGES.required;
  if (link && !validLink(link)) errors.link = BANNER_LINK_MESSAGE;
  if (position && !/^\d+$/.test(position)) errors.position = MESSAGES.invalidNumber;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    payload: {
      id: v.id,
      image_path: v.imagePath,
      title: v.title.trim(),
      subtitle: v.subtitle.trim(),
      link: link || null,
      position: position ? Number(position) : 0,
      is_active: v.isActive,
    },
  };
}
