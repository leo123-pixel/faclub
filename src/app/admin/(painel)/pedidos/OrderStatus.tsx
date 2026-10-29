"use client";

import { useState, useTransition } from "react";
import { SAVE_FAILED } from "@/components/admin/toggle-result";
import { ORDER_STATUSES, type OrderStatus as Status } from "@/lib/domain/admin-orders";
import { setOrderStatus } from "./actions";

/** Muda na hora e volta, com a mensagem, se a gravação falhar (padrão do RowToggle). */
export function OrderStatus({ id, initial }: { id: number; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: Status) {
    const previous = status;
    setStatus(next);
    setMessage(null);
    startTransition(async () => {
      const result = await setOrderStatus(id, next).catch(() => ({ ok: false as const, message: SAVE_FAILED }));
      if (!result.ok) {
        setStatus(previous);
        setMessage(result.message);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end">
      <select
        aria-label={`Status do pedido nº ${id}`}
        value={status}
        disabled={pending}
        onChange={(e) => change(e.target.value as Status)}
        className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {message && (
        <span role="alert" className="mt-1 text-[12px] text-low-ink">
          {message}
        </span>
      )}
    </span>
  );
}
