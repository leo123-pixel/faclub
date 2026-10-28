import { describe, expect, it } from "vitest";
import { DEFAULT_SCHEDULE_MESSAGE, onlyDigits, validateSettings, whatsappLink, type SettingsValues } from "./settings-input";

const WHATS = "Informe o WhatsApp com DDD, por exemplo (11) 2954-5764.";
const EMAIL = "Informe um e-mail válido.";
const HTTPS = "Use o endereço completo, começando com https://.";

function values(over: Partial<SettingsValues> = {}): SettingsValues {
  return {
    whatsapp: "(11) 2954-5764",
    phone: "(11) 2954-5764",
    email: "contato@faclubrificantes.com.br",
    address: "Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo",
    hoursWeekdays: "7h às 18h",
    hoursSaturday: "8h às 13h",
    groupLink: "",
    instagram: "",
    scheduleMessage: "Olá! Quero agendar uma troca de óleo.",
    ...over,
  };
}

const errorOf = (v: SettingsValues, field: keyof SettingsValues) => {
  const r = validateSettings(v);
  return r.ok ? null : (r.errors[field] ?? null);
};

describe("configurações da loja", () => {
  it("CONF-01.3: o WhatsApp precisa de 10 ou 11 dígitos", () => {
    expect(errorOf(values({ whatsapp: "(11) 2954-576" }), "whatsapp")).toBe(WHATS); // 9
    expect(errorOf(values({ whatsapp: "(011) 99999-00001" }), "whatsapp")).toBe(WHATS); // 13
    expect(errorOf(values({ whatsapp: "551199999000" }), "whatsapp")).toBe(WHATS); // 12
    expect(errorOf(values({ whatsapp: "" }), "whatsapp")).toBe(WHATS);
    expect(errorOf(values({ whatsapp: "(11) 2954-5764" }), "whatsapp")).toBeNull(); // 10
    expect(errorOf(values({ whatsapp: "11 99999-0000" }), "whatsapp")).toBeNull(); // 11
  });

  it("CONF-01.4: o e-mail precisa ter formato válido", () => {
    for (const email of ["contato", "contato@", "contato@loja", "@loja.com", "con tato@loja.com", ""]) {
      expect(errorOf(values({ email }), "email")).toBe(EMAIL);
    }
    expect(errorOf(values({ email: "vendas@fac-lub.com.br" }), "email")).toBeNull();
  });

  it("CONF-01.5: grupo e Instagram precisam começar com https://", () => {
    for (const link of ["http://chat.whatsapp.com/abc", "chat.whatsapp.com/abc", "https://"]) {
      expect(errorOf(values({ groupLink: link }), "groupLink")).toBe(HTTPS);
      expect(errorOf(values({ instagram: link }), "instagram")).toBe(HTTPS);
    }
    expect(errorOf(values({ groupLink: "https://chat.whatsapp.com/abc" }), "groupLink")).toBeNull();
    expect(errorOf(values({ instagram: "" }), "instagram")).toBeNull();
  });

  it("CONF-01.6: o WhatsApp vira só dígitos e o link é wa.me/55<dígitos>", () => {
    expect(onlyDigits("(11) 2954-5764")).toBe("1129545764");
    expect(whatsappLink("1129545764")).toBe("https://wa.me/551129545764");
    expect(whatsappLink("1129545764", "Olá! Quero agendar uma troca de óleo.")).toBe(
      "https://wa.me/551129545764?text=Ol%C3%A1!%20Quero%20agendar%20uma%20troca%20de%20%C3%B3leo.",
    );
    const r = validateSettings(values({ whatsapp: "(11) 99999-0000" }));
    expect(r.ok && r.payload.whatsapp).toBe("11999990000");
  });

  it("aceita as configurações completas e monta o payload da tabela settings", () => {
    const r = validateSettings(values({ groupLink: " https://chat.whatsapp.com/abc ", scheduleMessage: "  " }));
    expect(r).toEqual({
      ok: true,
      payload: {
        id: 1,
        whatsapp: "1129545764",
        phone: "(11) 2954-5764",
        email: "contato@faclubrificantes.com.br",
        address: "Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo",
        hours_weekdays: "7h às 18h",
        hours_saturday: "8h às 13h",
        group_link: "https://chat.whatsapp.com/abc",
        instagram: null,
        schedule_message: DEFAULT_SCHEDULE_MESSAGE,
      },
    });
  });
});
