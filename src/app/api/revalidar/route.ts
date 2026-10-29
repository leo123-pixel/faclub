import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * Revalida o site todo. Serve à Onbind depois de importar dados direto no
 * banco e aos testes depois do seed; o painel já revalida a cada gravação.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ revalidated: false }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
