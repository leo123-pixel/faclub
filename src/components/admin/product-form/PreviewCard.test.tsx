import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreviewCard } from "./PreviewCard";

const base = { brandName: "Lubrax", name: "Top Turbo 15W-40", packageLabel: "Balde 20L", price: 389.9, promoPrice: 349.9 };

describe("PreviewCard", () => {
  it("em oferta mostra o selo, o preço promocional e o normal riscado", () => {
    render(<PreviewCard {...base} isPromo />);
    const card = screen.getByRole("region", { name: "Prévia no site" });
    expect(card).toHaveTextContent("Oferta");
    expect(card).toHaveTextContent("R$ 349,90");
    expect(card.querySelector("s")).toHaveTextContent("R$ 389,90");
  });

  it("fora de oferta mostra só o preço normal, sem selo", () => {
    render(<PreviewCard {...base} isPromo={false} />);
    const card = screen.getByRole("region", { name: "Prévia no site" });
    expect(card).not.toHaveTextContent("Oferta");
    expect(card).not.toHaveTextContent("R$ 349,90");
    expect(card).toHaveTextContent("R$ 389,90");
    expect(card.querySelector("s")).toBeNull();
  });
});
