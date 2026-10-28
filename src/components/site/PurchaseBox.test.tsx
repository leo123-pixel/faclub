import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PurchaseBox } from "./PurchaseBox";

// a primeira do cadastro é o Balde 20L, como no seed e na captura
const variants = [
  { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
  { label: "Frasco 1L", price: 39.9, promoPrice: null },
  { label: "Frasco 4L", price: 149.9, promoPrice: 139.9 },
];

const chip = (name: string) => screen.getByRole("button", { name });
const qty = () => screen.getByRole("status", { name: "Quantidade" });

describe("embalagem, preço e quantidade", () => {
  it("PDP-01.4: escolher a embalagem troca o preço e a legenda", async () => {
    render(<PurchaseBox variants={variants} isPromo={false} />);
    await userEvent.click(chip("Frasco 1L"));
    expect(screen.getByText("R$ 39,90")).toBeInTheDocument();
    expect(screen.getByText("à vista · frasco 1L")).toBeInTheDocument();
    expect(screen.queryByText("R$ 389,90")).not.toBeInTheDocument();
    await userEvent.click(chip("Frasco 4L"));
    expect(screen.getByText("R$ 149,90")).toBeInTheDocument();
    expect(screen.getByText("à vista · frasco 4L")).toBeInTheDocument();
  });

  it("PDP-01.5: abre com a primeira embalagem marcada e quantidade 1", () => {
    render(<PurchaseBox variants={variants} isPromo={false} />);
    expect(chip("Balde 20L")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Frasco 1L")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("R$ 389,90")).toBeInTheDocument();
    expect(screen.getByText("à vista · balde 20L")).toBeInTheDocument();
    expect(qty()).toHaveTextContent("1");
    // os chips vão do menor ao maior, como na captura
    const labels = Array.from(screen.getByRole("group", { name: "Embalagem" }).querySelectorAll("button")).map((b) => b.textContent);
    expect(labels).toEqual(["Frasco 1L", "Frasco 4L", "Balde 20L"]);
  });

  it("PDP-01.6: + e − mudam a quantidade de 1 em 1, entre 1 e 99", async () => {
    render(<PurchaseBox variants={variants} isPromo={false} />);
    const plus = screen.getByRole("button", { name: "Aumentar quantidade" });
    const minus = screen.getByRole("button", { name: "Diminuir quantidade" });
    expect(minus).toBeDisabled();
    await userEvent.click(plus);
    expect(qty()).toHaveTextContent("2");
    await userEvent.click(minus);
    expect(qty()).toHaveTextContent("1");
    await userEvent.click(minus);
    expect(qty()).toHaveTextContent("1");
    for (let i = 0; i < 100; i++) await userEvent.click(plus);
    expect(qty()).toHaveTextContent("99");
    expect(plus).toBeDisabled();
    await userEvent.click(minus);
    expect(qty()).toHaveTextContent("98");
  });

  it("em oferta mostra o preço promocional ao lado do normal riscado; fora de oferta, só o preço", () => {
    const { container, unmount } = render(<PurchaseBox variants={variants} isPromo />);
    expect(screen.getByText("R$ 349,90")).toBeInTheDocument();
    expect(container.querySelector("s")).toHaveTextContent("R$ 389,90");
    unmount();
    const off = render(<PurchaseBox variants={variants} isPromo={false} />);
    expect(off.container.querySelector("s")).toBeNull();
    expect(screen.queryByText("R$ 349,90")).not.toBeInTheDocument();
  });

  it("PDP-01.14: o botão ao lado da quantidade é Adicionar ao carrinho", async () => {
    render(<PurchaseBox variants={variants} isPromo={false} />);
    const add = screen.getByRole("button", { name: "Adicionar ao carrinho" });
    expect(add.previousElementSibling).toContainElement(screen.getByRole("button", { name: "Aumentar quantidade" }));
    await userEvent.click(add);
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("O carrinho chega em breve. Peça pelo WhatsApp.");
  });
});
