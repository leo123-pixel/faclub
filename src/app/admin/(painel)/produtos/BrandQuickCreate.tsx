"use client";

import { useState, useTransition } from "react";
import { createBrand } from "./form-actions";

export function BrandQuickCreate({ onCreated }: { onCreated: (brand: { id: string; name: string }) => void }) {
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (name === null) {
    return (
      <button type="button" onClick={() => setName("")} className="mt-2 text-sm font-semibold text-ink underline">
        + Nova marca
      </button>
    );
  }

  function create() {
    start(async () => {
      const res = await createBrand(name ?? "");
      if (res.ok) {
        onCreated(res.brand);
        setName(null);
        setMessage(null);
      } else {
        setMessage(res.message);
      }
    });
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          autoFocus
          aria-label="Nome da marca"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              create();
            }
          }}
          className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-[15px] outline-none focus:border-ink"
        />
        <button
          type="button"
          disabled={pending}
          onClick={create}
          className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-gold disabled:opacity-60"
        >
          Criar
        </button>
      </div>
      {message && (
        <p role="alert" className="mt-1 text-sm text-low-ink">
          {message}
        </p>
      )}
    </div>
  );
}
