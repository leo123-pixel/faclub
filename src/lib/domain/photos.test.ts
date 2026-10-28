import { describe, expect, it } from "vitest";
import { acceptPhoto, resizeTarget, setCover, withNewPhoto, withoutPhoto, withValidCover, type Photo } from "./photos";

const MB = 1024 * 1024;
const p = (id: string, isCover = false): Photo => ({ id, path: `products/x/${id}.webp`, isCover });

describe("regras das fotos", () => {
  it("recusa a 7ª foto", () => {
    expect(acceptPhoto({ type: "image/jpeg", size: MB, name: "a.jpg" }, 6)).toEqual({
      ok: false,
      message: "Máximo de 6 fotos por produto.",
    });
    expect(acceptPhoto({ type: "image/jpeg", size: MB, name: "a.jpg" }, 5)).toEqual({ ok: true });
  });

  it("recusa GIF e arquivo acima de 15 MB", () => {
    const msg = "Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB.";
    expect(acceptPhoto({ type: "image/gif", size: MB, name: "a.gif" }, 0)).toEqual({ ok: false, message: msg });
    expect(acceptPhoto({ type: "image/jpeg", size: 16 * MB, name: "a.jpg" }, 0)).toEqual({ ok: false, message: msg });
    expect(acceptPhoto({ type: "image/png", size: 15 * MB, name: "a.png" }, 0)).toEqual({ ok: true });
  });

  it("aceita HEIC, inclusive quando o navegador não informa o tipo", () => {
    expect(acceptPhoto({ type: "image/heic", size: MB, name: "IMG_1.HEIC" }, 0)).toEqual({ ok: true });
    expect(acceptPhoto({ type: "", size: MB, name: "IMG_2.heic" }, 0)).toEqual({ ok: true });
    expect(acceptPhoto({ type: "image/webp", size: MB, name: "a.webp" }, 0)).toEqual({ ok: true });
  });

  it("reduz o lado maior para 1600 px mantendo a proporção", () => {
    expect(resizeTarget(4032, 3024)).toEqual({ width: 1600, height: 1200 });
    expect(resizeTarget(3000, 2000)).toEqual({ width: 1600, height: 1067 });
    expect(resizeTarget(2000, 3000)).toEqual({ width: 1067, height: 1600 });
  });

  it("não amplia foto pequena", () => {
    expect(resizeTarget(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("a primeira foto vira capa; as seguintes não", () => {
    const one = withNewPhoto([], p("a"));
    expect(one).toEqual([p("a", true)]);
    expect(withNewPhoto(one, p("b"))).toEqual([p("a", true), p("b")]);
  });

  it("remover a capa passa a capa para a primeira restante", () => {
    const photos = setCover([p("a"), p("b"), p("c")], "b");
    expect(photos).toEqual([p("a"), p("b", true), p("c")]);
    expect(withoutPhoto(photos, "b")).toEqual([p("a", true), p("c")]);
    expect(withoutPhoto(photos, "c")).toEqual([p("a"), p("b", true)]);
    expect(withoutPhoto([p("a", true)], "a")).toEqual([]);
  });

  it("foto com envio falho não fica com a capa", () => {
    const failedCover = { ...p("a", true), failed: true };
    expect(withValidCover([failedCover, p("b")])).toEqual([{ ...p("a"), failed: true }, p("b", true)]);
    expect(withValidCover([p("a"), p("b", true)])).toEqual([p("a"), p("b", true)]);
    expect(withValidCover([{ ...p("a", true), failed: true }])).toEqual([{ ...p("a"), failed: true }]);
  });

  it("respeita um limite menor que 6 (logo de marca)", () => {
    expect(acceptPhoto({ type: "image/png", size: 10, name: "a.png" }, 1, 1)).toEqual({
      ok: false,
      message: "Máximo de 6 fotos por produto.",
    });
  });
});
