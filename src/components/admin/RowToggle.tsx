"use client";

import { useState, useTransition } from "react";
import { Switch } from "./Switch";

export type ToggleResult = { ok: true } | { ok: false; message: string };
export const SAVE_FAILED = "Não foi possível salvar. Tente de novo.";

type Props = {
  initial: boolean;
  label: string;
  action: (next: boolean) => Promise<ToggleResult>;
};

/** Muda na hora e volta, com a mensagem, se a gravação falhar. */
export function RowToggle({ initial, label, action }: Props) {
  const [checked, setChecked] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    setChecked(next);
    setMessage(null);
    startTransition(async () => {
      let result: ToggleResult;
      try {
        result = await action(next);
      } catch {
        result = { ok: false, message: SAVE_FAILED };
      }
      if (!result.ok) {
        setChecked(!next);
        setMessage(result.message);
      }
    });
  }

  return (
    <span className="inline-flex flex-col">
      <Switch checked={checked} label={label} onChange={change} disabled={pending} />
      {message && (
        <span role="alert" className="max-w-48 text-[12px] leading-tight text-low-ink">
          {message}
        </span>
      )}
    </span>
  );
}
