import { expect, test } from "@playwright/test";
import { anonClient, serviceClient } from "./support/supabase";

test.describe("Supabase local", () => {
  test("lê as 4 categorias pelo gateway", async () => {
    const { data, error } = await anonClient().from("categories").select("name").order("position");
    expect(error).toBeNull();
    expect(data?.map((c) => c.name)).toEqual(["Linha leve", "Linha pesada", "Filtros", "Aditivos e graxas"]);
  });

  test("cria usuário pelo admin API e faz login", async () => {
    const email = `stack-${Date.now()}@faclub.local`;
    const created = await serviceClient().auth.admin.createUser({
      email,
      password: "senha-forte-1",
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    expect(created.error).toBeNull();
    const { data, error } = await anonClient().auth.signInWithPassword({ email, password: "senha-forte-1" });
    expect(error).toBeNull();
    expect(data.session?.user.app_metadata.role).toBe("admin");
    // o token precisa servir para o PostgREST (role = authenticated)
    const authed = anonClient();
    await authed.auth.setSession(data.session!);
    const read = await authed.from("products").select("id").limit(1);
    expect(read.error).toBeNull();
  });

  test("envia e lê de volta um arquivo no Storage simulado", async () => {
    const storage = serviceClient().storage.from("product-images");
    const path = `stack/${Date.now()}.txt`;
    const up = await storage.upload(path, new Blob(["conteúdo"], { type: "text/plain" }));
    expect(up.error).toBeNull();
    const res = await fetch(storage.getPublicUrl(path).data.publicUrl);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(await res.text()).toBe("conteúdo");
  });
});
