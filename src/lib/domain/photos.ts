export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_SIDE = 1600;

export const PHOTO_MESSAGES = {
  tooMany: "Máximo de 6 fotos por produto.",
  badFile: "Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB.",
} as const;

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type Photo = { id: string; path: string; isCover: boolean };

export function isHeic(file: { type: string; name: string }) {
  return /image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function acceptPhoto(
  file: { type: string; size: number; name: string },
  currentCount: number,
): { ok: true } | { ok: false; message: string } {
  if (currentCount >= MAX_PHOTOS) return { ok: false, message: PHOTO_MESSAGES.tooMany };
  const typeOk = TYPES.includes(file.type) || isHeic(file);
  if (!typeOk || file.size > MAX_PHOTO_BYTES) return { ok: false, message: PHOTO_MESSAGES.badFile };
  return { ok: true };
}

/** Tamanho final com o lado maior em até `max` px; nunca amplia. */
export function resizeTarget(width: number, height: number, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function withNewPhoto(photos: Photo[], photo: Photo): Photo[] {
  return [...photos, { ...photo, isCover: photos.length === 0 }];
}

export function setCover(photos: Photo[], id: string): Photo[] {
  return photos.map((ph) => ({ ...ph, isCover: ph.id === id }));
}

export function withoutPhoto(photos: Photo[], id: string): Photo[] {
  const removed = photos.find((ph) => ph.id === id);
  const rest = photos.filter((ph) => ph.id !== id);
  if (removed?.isCover && rest.length > 0) return setCover(rest, rest[0].id);
  return rest;
}
