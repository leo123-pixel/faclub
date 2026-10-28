import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Photo } from "@/lib/domain/photos";
import { PhotoUploader, type UploadFn } from "./PhotoUploader";

const file = (name: string, type: string, size = 1000) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};
const prepare = async (f: File) => new Blob([f], { type: "image/webp" });
const okUpload: UploadFn = async () => ({ ok: true });
const user = () => userEvent.setup({ applyAccept: false });

function setup(photos: Photo[] = [], upload: UploadFn = okUpload, max?: number) {
  const onChange = vi.fn<(p: Photo[]) => void>();
  render(
    <PhotoUploader productId="p1" photos={photos} onChange={onChange} upload={upload} prepare={prepare} max={max} />,
  );
  return { onChange, input: () => screen.getByLabelText("Enviar fotos") };
}

const six = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}`, path: `products/p1/f${i}.webp`, isCover: i === 0 }));
const lastCall = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)![0] as Photo[];

describe("PhotoUploader", () => {
  it("PFORM-01.7: com 6 fotos, a 7ª é recusada com a mensagem", async () => {
    const full = [...six, { id: "f5", path: "products/p1/f5.webp", isCover: false }];
    const { input, onChange } = setup(full);
    await user().upload(input(), file("a.jpg", "image/jpeg"));
    expect(screen.getByRole("alert")).toHaveTextContent("Máximo de 6 fotos por produto.");
    expect(screen.getAllByRole("figure")).toHaveLength(6);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("com 5 fotos, de duas novas só a primeira entra", async () => {
    const { input, onChange } = setup(six);
    await user().upload(input(), [file("a.jpg", "image/jpeg"), file("b.jpg", "image/jpeg")]);
    expect(screen.getByRole("alert")).toHaveTextContent("Máximo de 6 fotos por produto.");
    expect(lastCall(onChange)).toHaveLength(6);
  });

  it("PFORM-01.8: GIF ou arquivo acima de 15 MB mostra a mensagem de formato", async () => {
    const { input, onChange } = setup();
    await user().upload(input(), file("a.gif", "image/gif"));
    expect(screen.getByRole("alert")).toHaveTextContent("Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB.");
    await user().upload(input(), file("grande.jpg", "image/jpeg", 16 * 1024 * 1024));
    expect(screen.getByRole("alert")).toHaveTextContent("Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB.");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("PFORM-01.9: marcar capa põe o selo só naquela foto", async () => {
    const { onChange } = setup(six.slice(0, 3));
    const third = screen.getByRole("figure", { name: "Foto 3" });
    await user().click(within(third).getByRole("button", { name: "Usar como capa" }));
    expect(within(third).getByText("Capa")).toBeVisible();
    expect(screen.getAllByText("Capa")).toHaveLength(1);
    expect(lastCall(onChange).map((p) => p.isCover)).toEqual([false, false, true]);
  });

  it("PFORM-01.10: a primeira foto enviada vira capa", async () => {
    const { input, onChange } = setup();
    await user().upload(input(), [file("a.jpg", "image/jpeg"), file("b.png", "image/png")]);
    expect(within(screen.getByRole("figure", { name: "Foto 1" })).getByText("Capa")).toBeVisible();
    expect(within(screen.getByRole("figure", { name: "Foto 2" })).queryByText("Capa")).toBeNull();
    const photos = lastCall(onChange);
    expect(photos.map((p) => p.isCover)).toEqual([true, false]);
    expect(photos[0].path).toMatch(/^products\/p1\/.+\.webp$/);
  });

  it("PFORM-01.11: remover a capa passa o selo para a primeira restante", async () => {
    const { onChange } = setup(six.slice(0, 3));
    await user().click(within(screen.getByRole("figure", { name: "Foto 1" })).getByRole("button", { name: "Remover" }));
    expect(screen.getAllByRole("figure")).toHaveLength(2);
    expect(within(screen.getByRole("figure", { name: "Foto 1" })).getByText("Capa")).toBeVisible();
    expect(lastCall(onChange)).toEqual([
      { id: "f1", path: "products/p1/f1.webp", isCover: true },
      { id: "f2", path: "products/p1/f2.webp", isCover: false },
    ]);
  });

  it("envio que falha marca só aquela foto e o tentar de novo envia", async () => {
    let calls = 0;
    const flaky: UploadFn = async () => ({ ok: calls++ !== 1 });
    const { input, onChange } = setup([], flaky);
    await user().upload(input(), [file("a.jpg", "image/jpeg"), file("b.jpg", "image/jpeg")]);
    const second = screen.getByRole("figure", { name: "Foto 2" });
    expect(within(second).getByRole("button", { name: "Falhou · tentar de novo" })).toBeVisible();
    expect(within(screen.getByRole("figure", { name: "Foto 1" })).queryByText(/Falhou/)).toBeNull();
    expect(lastCall(onChange)).toHaveLength(1);
    await user().click(within(second).getByRole("button", { name: "Falhou · tentar de novo" }));
    expect(lastCall(onChange)).toHaveLength(2);
  });

  it("PFORM-01.10: se a 1ª foto falha e a 2ª é enviada, a 2ª vira capa", async () => {
    let calls = 0;
    const firstFails: UploadFn = async () => ({ ok: calls++ !== 0 });
    const { input, onChange } = setup([], firstFails);
    await user().upload(input(), [file("a.jpg", "image/jpeg"), file("b.jpg", "image/jpeg")]);
    expect(lastCall(onChange)).toEqual([expect.objectContaining({ isCover: true })]);
    expect(within(screen.getByRole("figure", { name: "Foto 2" })).getByText("Capa")).toBeVisible();
    expect(within(screen.getByRole("figure", { name: "Foto 1" })).queryByText("Capa")).toBeNull();
  });

  it("com max 1 (logo), uma segunda foto troca a primeira", async () => {
    const { input, onChange } = setup([], okUpload, 1);
    await user().upload(input(), file("a.png", "image/png"));
    const first = lastCall(onChange)[0].path;
    await user().upload(input(), file("b.png", "image/png"));
    const photos = lastCall(onChange);
    expect(photos).toHaveLength(1);
    expect(photos[0].path).not.toBe(first);
    expect(screen.getAllByRole("figure")).toHaveLength(1);
  });
});
