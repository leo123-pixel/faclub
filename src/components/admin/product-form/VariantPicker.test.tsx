import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { VariantValues } from "@/lib/domain/product-input";
import { VariantPicker } from "./VariantPicker";

function Harness({ initial = [] as VariantValues[] }) {
  const [variants, setVariants] = useState(initial);
  return (
    <>
      <VariantPicker variants={variants} onChange={setVariants} />
      <output data-testid="value">{JSON.stringify(variants)}</output>
    </>
  );
}
const value = () => JSON.parse(screen.getByTestId("value").textContent!) as VariantValues[];

describe("VariantPicker", () => {
  it("PFORM-01.12: marcar uma embalagem mostra os preços dela e desmarcar a remove", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Balde 20L" }));
    const group = screen.getByRole("group", { name: "Balde 20L" });
    await userEvent.type(within(group).getByLabelText("Preço (R$)"), "389,90");
    await userEvent.type(within(group).getByLabelText("Preço promocional (R$)"), "349,90");
    expect(value()).toEqual([{ label: "Balde 20L", price: "389,90", promoPrice: "349,90" }]);
    expect(screen.getByRole("button", { name: "Balde 20L" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Balde 20L" }));
    expect(screen.queryByRole("group", { name: "Balde 20L" })).toBeNull();
    expect(value()).toEqual([]);
  });

  it("Outra cria uma embalagem com o nome digitado", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Outra" }));
    await userEvent.type(screen.getByLabelText("Nome da embalagem"), "Pote 500g");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(screen.getByRole("group", { name: "Pote 500g" })).toBeVisible();
    expect(value()).toEqual([{ label: "Pote 500g", price: "", promoPrice: "" }]);
  });
});
