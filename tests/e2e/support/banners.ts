import { randomUUID } from "node:crypto";
import { serviceClient } from "./supabase";

/** Cria um banner com foto no Storage simulado, direto pelo service role. */
export async function addBanner(title: string, position: number, isActive = true) {
  const db = serviceClient();
  const id = randomUUID();
  const image_path = `banners/${id}.webp`;
  await db.storage.from("product-images").upload(image_path, new Blob(["x"], { type: "image/webp" }), { upsert: true });
  const { error } = await db
    .from("banners")
    .insert({ id, image_path, title, subtitle: `Texto de ${title}`, link: "/produtos", position, is_active: isActive });
  if (error) throw error;
  return id;
}
