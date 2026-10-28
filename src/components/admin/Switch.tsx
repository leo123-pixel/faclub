"use client";

type Props = {
  checked: boolean;
  label: string;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
};

/** Interruptor acessível; o alvo de toque tem 44 px de altura. */
export function Switch({ checked, label, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="inline-flex h-11 items-center disabled:opacity-60"
    >
      <span
        className={`relative inline-block h-7 w-12 rounded-full transition-colors ${checked ? "bg-ok" : "bg-line"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
