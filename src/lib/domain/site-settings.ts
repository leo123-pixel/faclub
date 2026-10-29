import { DEFAULT_SCHEDULE_MESSAGE, whatsappLink } from "./settings-input";

/** A linha de `settings` como o Supabase devolve. */
export type SettingsRow = {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  hours_weekdays: string;
  hours_saturday: string;
  group_link: string | null;
  instagram: string | null;
  schedule_message: string;
};

/** O que as páginas públicas usam; grupo e Instagram vazios escondem os botões. */
export type SiteSettings = {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  groupLink: string;
  instagram: string;
  scheduleMessage: string;
};

/** Valores iniciais da loja (painel-conteudo, Assumptions). */
export const INITIAL_SETTINGS: SiteSettings = {
  whatsapp: "1129545764",
  phone: "(11) 2954-5764",
  email: "contato@faclubrificantes.com.br",
  address: "Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo",
  hoursWeekdays: "7h às 18h",
  hoursSaturday: "8h às 13h",
  groupLink: "",
  instagram: "",
  scheduleMessage: DEFAULT_SCHEDULE_MESSAGE,
};

export const SITE_MESSAGES = {
  budget: "Olá! Quero um orçamento.",
  contact: "Olá! Vim pelo site da FAC LUB.",
} as const;

const or = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;

/** Sem linha em `settings`, ou com um campo vazio, o site usa os valores iniciais. */
export function withDefaults(row: SettingsRow | null): SiteSettings {
  if (!row) return INITIAL_SETTINGS;
  return {
    whatsapp: or(row.whatsapp, INITIAL_SETTINGS.whatsapp),
    phone: or(row.phone, INITIAL_SETTINGS.phone),
    email: or(row.email, INITIAL_SETTINGS.email),
    address: or(row.address, INITIAL_SETTINGS.address),
    hoursWeekdays: or(row.hours_weekdays, INITIAL_SETTINGS.hoursWeekdays),
    hoursSaturday: or(row.hours_saturday, INITIAL_SETTINGS.hoursSaturday),
    groupLink: row.group_link?.trim() ?? "",
    instagram: row.instagram?.trim() ?? "",
    scheduleMessage: or(row.schedule_message, INITIAL_SETTINGS.scheduleMessage),
  };
}

export const scheduleLink = (s: SiteSettings) => whatsappLink(s.whatsapp, s.scheduleMessage);
export const budgetLink = (s: SiteSettings) => whatsappLink(s.whatsapp, SITE_MESSAGES.budget);
export const contactLink = (s: SiteSettings) => whatsappLink(s.whatsapp, SITE_MESSAGES.contact);
