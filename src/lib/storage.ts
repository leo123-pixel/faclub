import { SUPABASE_URL } from "./supabase/env";

export const PRODUCT_BUCKET = "product-images";

/** URL pública de um arquivo do bucket de fotos. */
export const publicImageUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
