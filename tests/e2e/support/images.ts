import type { Page } from "@playwright/test";
import { serviceClient } from "./supabase";

/** PNG de `w`×`h` gerado no navegador da página, pronto para setInputFiles. */
export async function pngFile(page: Page, name: string, w: number, h: number) {
  const bytes = await page.evaluate(
    async ([width, height]) => {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#e2b33c";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#0a1530";
      ctx.fillRect(width / 4, height / 4, width / 2, height / 2);
      const blob = await canvas.convertToBlob({ type: "image/png" });
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    },
    [w, h] as const,
  );
  return { name, mimeType: "image/png", buffer: Buffer.from(bytes) };
}

/** Dá uma foto de capa a um produto do seed, direto no Storage e no banco. */
export async function addCoverPhoto(productName: string) {
  const db = serviceClient();
  const { data: p } = await db.from("products").select("id").eq("name", productName).single();
  const path = `products/${p!.id}/seed.webp`;
  await db.storage.from("product-images").upload(path, new Blob(["x"], { type: "image/webp" }), { upsert: true });
  await db.from("product_images").insert({ product_id: p!.id, path, is_cover: true, position: 0 });
  return { id: p!.id as string, path };
}
