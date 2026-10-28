import { isHeic, resizeTarget } from "@/lib/domain/photos";

/** Reduz para o lado maior de 1600 px e converte para WebP (qualidade 0,8). */
export async function compressToWebp(file: File): Promise<Blob> {
  let source: Blob = file;
  if (isHeic(file)) {
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    source = Array.isArray(out) ? out[0] : out;
  }
  const bitmap = await createImageBitmap(source);
  const { width, height } = resizeTarget(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falhou"))), "image/webp", 0.8),
  );
}
