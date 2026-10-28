import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProductGallery } from "./ProductGallery";

const ALT = "Lubrax Top Turbo 15W-40";
const images = ["products/1/a.webp", "products/1/b.webp", "products/1/c.webp"];

describe("galeria do produto", () => {
  it("PDP-01.3: a miniatura troca a foto grande e ganha a borda escura", async () => {
    render(<ProductGallery images={images} alt={ALT} promo={false} />);
    const big = () => screen.getByRole("img", { name: ALT });
    expect(big()).toHaveAttribute("src", expect.stringContaining("products/1/a.webp"));
    const first = screen.getByRole("button", { name: "Foto 1 de 3" });
    const second = screen.getByRole("button", { name: "Foto 2 de 3" });
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(first).toHaveClass("border-ink");
    expect(second).not.toHaveClass("border-ink");

    await userEvent.click(second);
    expect(big()).toHaveAttribute("src", expect.stringContaining("products/1/b.webp"));
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveClass("border-ink");
    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(first).not.toHaveClass("border-ink");
  });

  it("sem fotos mostra a imagem neutra e nenhuma miniatura", () => {
    render(<ProductGallery images={[]} alt={ALT} promo />);
    expect(screen.getByRole("img", { name: `Sem foto: ${ALT}` })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Fotos do produto" })).not.toBeInTheDocument();
    expect(screen.getByText("Oferta da semana")).toBeInTheDocument();
  });
});
