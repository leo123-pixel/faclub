import { redirect } from "next/navigation";

// "Visão geral": os indicadores moram na lista de produtos (design.md).
export default function AdminHome() {
  redirect("/admin/produtos");
}
