import type { Metadata } from "next";
import { RESET_MESSAGES } from "../messages";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Esqueci minha senha | FAC LUB Painel", robots: { index: false } };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/admin/esqueci-senha">) {
  const { erro } = await searchParams;
  return <ResetForm initialMessage={erro === "link" ? RESET_MESSAGES.badLink : null} />;
}
