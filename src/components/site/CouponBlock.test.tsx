import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CouponBlock } from "./CouponBlock";

const coupon = { code: "FACLUB10", percent: 10 };
const GROUP = "https://chat.whatsapp.com/ofertas";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

const copyButton = () => screen.getByRole("button", { name: /^(Copiar|Copiado)$/ });

describe("bloco do cupom", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("CUPOM-01.1: Copiar grava o código e o rótulo vira Copiado por 2 segundos", async () => {
    const copied: string[] = [];
    stubClipboard(async (text) => {
      copied.push(text);
    });
    render(<CouponBlock coupon={coupon} groupLink={GROUP} />);
    await act(async () => {
      fireEvent.click(copyButton());
    });
    expect(copied).toEqual(["FACLUB10"]);
    expect(copyButton()).toHaveTextContent("Copiado");
    await act(async () => {
      vi.advanceTimersByTime(1900);
    });
    expect(copyButton()).toHaveTextContent("Copiado");
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(copyButton()).toHaveTextContent("Copiar");
  });

  it("CUPOM-01.2: sem permissão de copiar, o código fica selecionado e aparece a instrução", async () => {
    stubClipboard(() => Promise.reject(new DOMException("negado", "NotAllowedError")));
    render(<CouponBlock coupon={coupon} groupLink={GROUP} />);
    await act(async () => {
      fireEvent.click(copyButton());
    });
    const code = screen.getByRole("textbox", { name: "Código do cupom" }) as HTMLInputElement;
    expect(document.activeElement).toBe(code);
    expect(code.value.slice(code.selectionStart ?? 0, code.selectionEnd ?? 0)).toBe("FACLUB10");
    expect(screen.getByRole("status")).toHaveTextContent("Selecione e copie o código.");
    expect(copyButton()).toHaveTextContent("Copiar");
  });

  it("CUPOM-01.2: sem a API de área de transferência, o mesmo caminho", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    render(<CouponBlock coupon={coupon} groupLink={GROUP} />);
    await act(async () => {
      fireEvent.click(copyButton());
    });
    expect(screen.getByRole("status")).toHaveTextContent("Selecione e copie o código.");
  });

  it("CUPOM-01.3: mostra o texto do cupom e que o desconto vale só para serviços na loja", () => {
    render(<CouponBlock coupon={coupon} groupLink={GROUP} />);
    expect(screen.getByRole("heading", { name: "10% de desconto na sua troca" })).toBeInTheDocument();
    expect(screen.getByText("Mostre o cupom no atendimento e entre no grupo para receber as ofertas da semana.")).toBeInTheDocument();
    expect(screen.getByText("O desconto vale só para serviços feitos na loja.")).toBeInTheDocument();
  });

  it("CUPOM-01.4: Entrar no grupo de ofertas abre o link do grupo em nova aba", () => {
    render(<CouponBlock coupon={coupon} groupLink={GROUP} />);
    const link = screen.getByRole("link", { name: "Entrar no grupo de ofertas" });
    expect(link).toHaveAttribute("href", GROUP);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
