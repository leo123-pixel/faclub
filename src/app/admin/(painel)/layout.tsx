import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export const metadata: Metadata = { title: "Painel | FAC LUB", robots: { index: false } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
  return <AdminShell userLabel={name ?? user.email ?? "Administrador"}>{children}</AdminShell>;
}
