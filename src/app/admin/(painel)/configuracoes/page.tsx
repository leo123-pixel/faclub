import { DEFAULT_SCHEDULE_MESSAGE, formatPhone, type SettingsValues } from "@/lib/domain/settings-input";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { PageHeader } from "../PageHeader";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  const initial: SettingsValues = {
    whatsapp: data ? formatPhone(data.whatsapp) : "",
    phone: data?.phone ?? "",
    email: data?.email ?? "",
    address: data?.address ?? "",
    hoursWeekdays: data?.hours_weekdays ?? "",
    hoursSaturday: data?.hours_saturday ?? "",
    groupLink: data?.group_link ?? "",
    instagram: data?.instagram ?? "",
    scheduleMessage: data?.schedule_message ?? DEFAULT_SCHEDULE_MESSAGE,
  };
  return (
    <>
      <PageHeader eyebrow="Loja" title="Configurações" />
      <SettingsForm initial={initial} />
    </>
  );
}
