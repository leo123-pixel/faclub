import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Rotas do painel abertas sem sessão.
const PUBLIC = ["/admin/login", "/admin/esqueci-senha", "/admin/nova-senha", "/admin/auth/callback"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  // Renova a sessão em toda rota do painel.
  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (PUBLIC.some((p) => path === p || path.startsWith(`${p}/`))) return response;

  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = "";

  if (!data.user) return redirectKeepingCookies(login, response);
  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    login.searchParams.set("erro", "sem-permissao");
    return redirectKeepingCookies(login, response);
  }
  return response;
}

function redirectKeepingCookies(url: URL, from: NextResponse) {
  const res = NextResponse.redirect(url);
  for (const c of from.cookies.getAll()) res.cookies.set(c);
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
