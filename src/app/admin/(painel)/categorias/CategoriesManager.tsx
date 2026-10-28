"use client";

import { useState, useTransition } from "react";
import { countLabel, type TaxonomyResult } from "../taxonomy-messages";
import { deleteCategory, moveCategory, saveCategory } from "./actions";

type Category = { id: string; name: string; count: number };

const btn = "h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink disabled:opacity-40";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(action: () => Promise<TaxonomyResult>, after?: () => void) {
    setMessage(null);
    start(async () => {
      const res = await action();
      if (res.ok) after?.();
      else setMessage(res.message);
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveCategory(null, name), () => setName(""));
        }}
        className="flex flex-col gap-3 rounded-2xl border border-line-soft bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="block flex-1 text-sm font-semibold text-ink">
          Nova categoria
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block h-11 w-full rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
          />
        </label>
        <button type="submit" disabled={pending} className="h-11 rounded-xl bg-ink px-5 font-semibold text-gold">
          Adicionar
        </button>
      </form>

      {message && (
        <p role="alert" className="rounded-xl bg-low px-4 py-3 text-low-ink">
          {message}
        </p>
      )}

      <ul aria-label="Categorias" className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-white">
        {categories.map((c, i) => (
          <li key={c.id} aria-label={c.name} className="flex flex-wrap items-center gap-3 px-5 py-3">
            {editing?.id === c.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => saveCategory(c.id, editing.name), () => setEditing(null));
                }}
              >
                <input
                  autoFocus
                  aria-label={`Nome de ${c.name}`}
                  value={editing.name}
                  onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
                />
                <button type="submit" className={btn}>
                  Salvar
                </button>
              </form>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="text-[13px] text-muted">{countLabel(c.count)}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn} disabled={pending || i === 0} onClick={() => run(() => moveCategory(c.id, "up"))}>
                Subir
              </button>
              <button
                type="button"
                className={btn}
                disabled={pending || i === categories.length - 1}
                onClick={() => run(() => moveCategory(c.id, "down"))}
              >
                Descer
              </button>
              <button type="button" className={btn} onClick={() => setEditing({ id: c.id, name: c.name })}>
                Renomear
              </button>
              <button
                type="button"
                className={btn}
                disabled={pending}
                onClick={() => {
                  if (window.confirm(`Excluir a categoria ${c.name}?`)) run(() => deleteCategory(c.id));
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
