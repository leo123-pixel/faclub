import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RowToggle, type ToggleResult } from "./RowToggle";

const deferred = () => {
  let resolve!: (r: ToggleResult) => void;
  const promise = new Promise<ToggleResult>((r) => (resolve = r));
  return { promise, resolve };
};

describe("RowToggle", () => {
  it("muda na hora, antes da gravação terminar", async () => {
    const d = deferred();
    render(<RowToggle initial={false} label="Em oferta: Top Turbo" action={() => d.promise} />);
    const sw = screen.getByRole("switch", { name: "Em oferta: Top Turbo" });
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    d.resolve({ ok: true });
    await screen.findByRole("switch", { name: "Em oferta: Top Turbo" });
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("PTOG-01.4: gravação que falha volta o interruptor e mostra a mensagem", async () => {
    render(
      <RowToggle
        initial
        label="Visível no site: Top Turbo"
        action={async () => ({ ok: false, message: "Não foi possível salvar. Tente de novo." })}
      />,
    );
    const sw = screen.getByRole("switch", { name: "Visível no site: Top Turbo" });
    await userEvent.click(sw);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar. Tente de novo.");
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("mostra a mensagem que a action devolve e trata exceção como falha", async () => {
    const { unmount } = render(
      <RowToggle
        initial={false}
        label="Em oferta: Urania"
        action={async () => ({ ok: false, message: "Informe o preço promocional antes de ativar a oferta." })}
      />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Em oferta: Urania" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Informe o preço promocional antes de ativar a oferta.");
    expect(screen.getByRole("switch", { name: "Em oferta: Urania" })).toHaveAttribute("aria-checked", "false");
    unmount();

    render(
      <RowToggle initial={false} label="Em oferta: Brutus" action={() => Promise.reject(new Error("rede"))} />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Em oferta: Brutus" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar. Tente de novo.");
  });
});
