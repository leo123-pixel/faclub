import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { CatalogItem } from "@/lib/domain/catalog";
import { ProductCard } from "./ProductCard";

const item = (over: Partial<CatalogItem> = {}): CatalogItem => ({
  id: "1",
  slug: "top-turbo-15w-40",
  name: "Top Turbo 15W-40",
  brandName: "Lubrax",
  categorySlug: "linha-pesada",
  categoryName: "Linha pesada",
  sku: null,
  viscosity: "15W-40",
  application: "",
  isPromo: false,
  isFeatured: false,
  stock: 3,
  coverPath: "products/1/a.webp",
  variants: [
    { label: "Balde 20L", price: 389.9, promoPrice: 349.9 },
    { label: "Frasco 1L", price: 39.9, promoPrice: null },
  ],
  ...over,
});

const card = () => screen.getByRole("article");

describe("card de produto", () => {
  it("CAT-01.13: em oferta mostra o selo Oferta e o preço promocional ao lado do normal riscado", () => {
    render(<ProductCard item={item({ isPromo: true })} />);
    expect(within(card()).getByText("Oferta")).toBeInTheDocument();
    expect(within(card()).getByText("R$ 349,90")).toBeInTheDocument();
    const struck = card().querySelector("s");
    expect(struck).toHaveTextContent("R$ 389,90");
    cleanupAndRender(item({ isPromo: false }));
    expect(within(card()).queryByText("Oferta")).not.toBeInTheDocument();
    expect(card().querySelector("s")).toBeNull();
    expect(within(card()).getByText("R$ 389,90")).toBeInTheDocument();
    expect(within(card()).queryByText("R$ 349,90")).not.toBeInTheDocument();
  });

  it("CAT-01.14: mostra marca, embalagem, nome e preço no formato R$ 1.234,56", () => {
    render(<ProductCard item={item({ variants: [{ label: "Tambor 200L", price: 1234.56, promoPrice: null }] })} />);
    expect(within(card()).getByText("Lubrax · Tambor 200L")).toBeInTheDocument();
    expect(within(card()).getByRole("heading", { name: "Top Turbo 15W-40" })).toBeInTheDocument();
    expect(within(card()).getByText("R$ 1.234,56")).toBeInTheDocument();
  });

  it("foto que não carrega vira a imagem neutra", () => {
    render(<ProductCard item={item()} />);
    const photo = screen.getByRole("img", { name: "Lubrax Top Turbo 15W-40" });
    expect(photo).toHaveAttribute("src", expect.stringContaining("products/1/a.webp"));
    fireEvent.error(photo);
    expect(screen.queryByRole("img", { name: "Lubrax Top Turbo 15W-40" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sem foto: Lubrax Top Turbo 15W-40" })).toBeInTheDocument();
    cleanupAndRender(item({ coverPath: null }));
    expect(screen.getByRole("img", { name: "Sem foto: Lubrax Top Turbo 15W-40" })).toBeInTheDocument();
  });

  it("o card leva à página do produto e o + avisa que o carrinho chega em breve", async () => {
    render(<ProductCard item={item()} />);
    expect(screen.getByRole("link", { name: "Top Turbo 15W-40" })).toHaveAttribute("href", "/produtos/top-turbo-15w-40");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Lubrax Top Turbo 15W-40 ao carrinho" }));
    expect(screen.getByRole("status")).toHaveTextContent("O carrinho chega em breve. Peça pelo WhatsApp.");
  });
});

function cleanupAndRender(it: CatalogItem) {
  cleanup();
  render(<ProductCard item={it} />);
}
