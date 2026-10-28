import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyProduct, type ProductFormValues } from "@/lib/domain/product-input";
import { ProductForm, type SaveResult } from "./ProductForm";

const brands = [
  { id: "b-lubrax", name: "Lubrax" },
  { id: "b-shell", name: "Shell" },
];
const categories = [{ id: "c-pesada", name: "Linha pesada" }];

function filled(): ProductFormValues {
  return {
    ...emptyProduct("p1"),
    name: "Top Turbo 15W-40",
    brandId: "b-lubrax",
    categoryId: "c-pesada",
    stock: "12",
    variants: [{ label: "Balde 20L", price: "389,90", promoPrice: "" }],
    images: [{ path: "products/p1/a.webp", isCover: true }],
  };
}

function setup(initial: ProductFormValues = emptyProduct("p1")) {
  const onSave = vi.fn<(v: ProductFormValues) => Promise<SaveResult>>(async () => ({ ok: true }));
  const onCancel = vi.fn();
  render(
    <ProductForm
      mode="novo"
      initial={initial}
      brands={brands}
      categories={categories}
      onSave={onSave}
      onCancel={onCancel}
      upload={async () => ({ ok: true })}
      prepare={async (f) => f}
    />,
  );
  return { onSave, onCancel };
}

const save = () => userEvent.click(screen.getByRole("button", { name: "Salvar produto" }));
const section = (name: string) => screen.getByRole("region", { name });

afterEach(() => vi.restoreAllMocks());

describe("ProductForm", () => {
  it("PFORM-01.3: salvar vazio mostra Campo obrigatório em cada campo que falta e não salva", async () => {
    const { onSave } = setup();
    await save();
    const basic = section("Informações básicas");
    expect(within(basic).getAllByText("Campo obrigatório")).toHaveLength(3); // nome, marca, categoria
    expect(within(section("Preço e estoque")).getByText("Campo obrigatório")).toBeVisible(); // embalagem
    expect(within(section("Fotos")).getByText("Campo obrigatório")).toBeVisible();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("PFORM-01.4: promo igual ou maior que o preço mostra a mensagem e não salva", async () => {
    const { onSave } = setup(filled());
    const group = screen.getByRole("group", { name: "Balde 20L" });
    const promo = within(group).getByLabelText("Preço promocional (R$)");
    for (const value of ["389,90", "400"]) {
      await userEvent.clear(promo);
      await userEvent.type(promo, value);
      await save();
      expect(within(group).getByText("O preço promocional precisa ser menor que o preço.")).toBeVisible();
    }
    expect(onSave).not.toHaveBeenCalled();
  });

  it("PFORM-01.5: estoque, preço ou promo inválidos mostram Informe um número válido. e não salvam", async () => {
    const { onSave } = setup(filled());
    const stock = screen.getByLabelText("Estoque");
    await userEvent.clear(stock);
    await userEvent.type(stock, "-1");
    const group = screen.getByRole("group", { name: "Balde 20L" });
    const price = within(group).getByLabelText("Preço (R$)");
    await userEvent.clear(price);
    await userEvent.type(price, "abc");
    await userEvent.type(within(group).getByLabelText("Preço promocional (R$)"), "-5");
    await save();
    const section_ = section("Preço e estoque");
    expect(within(section_).getAllByText("Informe um número válido.")).toHaveLength(3);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("PFORM-01.13: mudar nome, marca, embalagem, preço e oferta atualiza a prévia sem salvar", async () => {
    const { onSave } = setup(filled());
    const preview = section("Prévia no site");
    expect(preview).not.toHaveTextContent("Oferta");
    expect(preview).toHaveTextContent("R$ 389,90");
    const name = screen.getByLabelText("Nome do produto");
    await userEvent.clear(name);
    await userEvent.type(name, "Rimula R4 15W-40");
    await userEvent.selectOptions(screen.getByLabelText("Marca"), "Shell");
    // a prévia mostra a primeira embalagem: tira o balde e marca o frasco
    await userEvent.click(screen.getByRole("button", { name: "Balde 20L" }));
    await userEvent.click(screen.getByRole("button", { name: "Frasco 1L" }));
    const frasco = screen.getByRole("group", { name: "Frasco 1L" });
    await userEvent.type(within(frasco).getByLabelText("Preço (R$)"), "52,90");
    await userEvent.type(within(frasco).getByLabelText("Preço promocional (R$)"), "47,90");
    await userEvent.click(within(section("Publicação")).getByRole("switch", { name: "Em oferta" }));
    expect(preview).toHaveTextContent("Rimula R4 15W-40");
    expect(preview).toHaveTextContent("Shell");
    expect(preview).not.toHaveTextContent("Lubrax");
    expect(preview).toHaveTextContent("Frasco 1L");
    expect(preview).toHaveTextContent("Oferta");
    expect(preview).toHaveTextContent("R$ 47,90");
    expect(preview.querySelector("s")).toHaveTextContent("R$ 52,90");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("PFORM-01.16: Cancelar com mudança pergunta e só sai ao confirmar", async () => {
    const { onCancel } = setup(filled());
    await userEvent.type(screen.getByLabelText("Nome do produto"), " X");
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(confirm).toHaveBeenCalledWith("Descartar as alterações?");
    expect(onCancel).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Cancelar sem mudança sai direto, sem perguntar", async () => {
    const { onCancel } = setup(filled());
    const confirm = vi.spyOn(window, "confirm");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("PFORM-01.18: Tipo oferece Mineral, Semissintético e Sintético", () => {
    setup();
    const options = within(screen.getByLabelText("Tipo")).getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Selecione", "Mineral", "Semissintético", "Sintético"]);
  });
});
