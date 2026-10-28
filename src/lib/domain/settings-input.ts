export const DEFAULT_SCHEDULE_MESSAGE = "Olá! Quero agendar uma troca de óleo.";

export const SETTINGS_MESSAGES = {
  whatsapp: "Informe o WhatsApp com DDD, por exemplo (11) 2954-5764.",
  email: "Informe um e-mail válido.",
  https: "Use o endereço completo, começando com https://.",
} as const;

/** O que o formulário de configurações guarda: textos como a loja digitou. */
export type SettingsValues = {
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

/** A linha única da tabela `settings`. */
export type SettingsPayload = {
  id: 1;
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

export const onlyDigits = (text: string) => text.replace(/\D/g, "");

/** "1129545764" vira "(11) 2954-5764"; "11999990000" vira "(11) 99999-0000". */
export function formatPhone(digits: string): string {
  const d = onlyDigits(digits);
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return digits;
}

/** Link do WhatsApp da loja, com a mensagem já escrita quando houver. */
export function whatsappLink(digits: string, message?: string): string {
  const base = `https://wa.me/55${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isHttpsUrl = (v: string) => /^https:\/\/\S+$/.test(v);

export type SettingsResult =
  | { ok: true; payload: SettingsPayload }
  | { ok: false; errors: Partial<Record<keyof SettingsValues, string>> };

export function validateSettings(v: SettingsValues): SettingsResult {
  const errors: Partial<Record<keyof SettingsValues, string>> = {};
  // CONF-01 AC 3: tira espaços, parênteses e hífens; o resto precisa ser 10 ou 11 dígitos
  const whatsapp = v.whatsapp.replace(/[\s()-]/g, "");
  if (!/^\d{10,11}$/.test(whatsapp)) errors.whatsapp = SETTINGS_MESSAGES.whatsapp;
  if (!EMAIL_RE.test(v.email.trim())) errors.email = SETTINGS_MESSAGES.email;
  const groupLink = v.groupLink.trim();
  const instagram = v.instagram.trim();
  if (groupLink && !isHttpsUrl(groupLink)) errors.groupLink = SETTINGS_MESSAGES.https;
  if (instagram && !isHttpsUrl(instagram)) errors.instagram = SETTINGS_MESSAGES.https;
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    payload: {
      id: 1,
      whatsapp,
      phone: v.phone.trim(),
      email: v.email.trim(),
      address: v.address.trim(),
      hours_weekdays: v.hoursWeekdays.trim(),
      hours_saturday: v.hoursSaturday.trim(),
      group_link: groupLink || null,
      instagram: instagram || null,
      schedule_message: v.scheduleMessage.trim() || DEFAULT_SCHEDULE_MESSAGE,
    },
  };
}
