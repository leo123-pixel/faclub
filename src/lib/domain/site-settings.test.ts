import { describe, expect, it } from "vitest";
import { budgetLink, contactLink, INITIAL_SETTINGS, scheduleLink, withDefaults, type SettingsRow } from "./site-settings";

const ROW: SettingsRow = {
  whatsapp: "11999990000",
  phone: "(11) 99999-0000",
  email: "loja@exemplo.com.br",
  address: "Rua A, 1",
  hours_weekdays: "8h às 17h",
  hours_saturday: "8h às 12h",
  group_link: "https://chat.whatsapp.com/abc",
  instagram: "https://instagram.com/faclub",
  schedule_message: "Quero trocar o óleo & o filtro?",
};

describe("configurações do site", () => {
  it("usa os valores iniciais da loja quando a tabela settings está vazia", () => {
    expect(withDefaults(null)).toEqual({
      whatsapp: "1129545764",
      phone: "(11) 2954-5764",
      email: "contato@faclubrificantes.com.br",
      address: "Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo",
      hoursWeekdays: "7h às 18h",
      hoursSaturday: "8h às 13h",
      groupLink: "",
      instagram: "",
      scheduleMessage: "Olá! Quero agendar uma troca de óleo.",
    });
    expect(withDefaults(null)).toEqual(INITIAL_SETTINGS);
  });

  it("campo de texto vazio volta ao valor inicial; grupo e Instagram vazios continuam vazios", () => {
    const s = withDefaults({ ...ROW, phone: "", address: "  ", schedule_message: "", group_link: null, instagram: "" });
    expect(s.phone).toBe("(11) 2954-5764");
    expect(s.address).toBe("Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo");
    expect(s.scheduleMessage).toBe("Olá! Quero agendar uma troca de óleo.");
    expect(s.groupLink).toBe("");
    expect(s.instagram).toBe("");
    expect(s.whatsapp).toBe("11999990000");
    expect(s.hoursSaturday).toBe("8h às 12h");
  });

  it("HEAD-01.3: o link de agendar usa o WhatsApp e a mensagem das configurações", () => {
    expect(scheduleLink(withDefaults(ROW))).toBe(
      "https://wa.me/5511999990000?text=Quero%20trocar%20o%20%C3%B3leo%20%26%20o%20filtro%3F",
    );
    expect(scheduleLink(withDefaults(null))).toBe(
      "https://wa.me/551129545764?text=Ol%C3%A1!%20Quero%20agendar%20uma%20troca%20de%20%C3%B3leo.",
    );
  });

  it("orçamento e contato abrem o WhatsApp com as mensagens próprias", () => {
    const s = withDefaults(ROW);
    expect(budgetLink(s)).toBe("https://wa.me/5511999990000?text=Ol%C3%A1!%20Quero%20um%20or%C3%A7amento.");
    expect(contactLink(s)).toBe("https://wa.me/5511999990000?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20FAC%20LUB.");
  });
});
