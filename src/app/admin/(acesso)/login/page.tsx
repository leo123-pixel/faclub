import type { Metadata } from "next";
import { SIGN_IN_MESSAGES } from "../messages";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar | FAC LUB Painel", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { erro } = await searchParams;
  return <LoginForm initialError={erro === "sem-permissao" ? SIGN_IN_MESSAGES.forbidden : null} />;
}
