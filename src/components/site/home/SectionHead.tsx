import type { ReactNode } from "react";

/** Título centralizado das seções da Home, com texto e botão opcionais. */
export function SectionHead({ id, title, text, action }: { id: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <h2 id={id} className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[56px]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export const darkButton =
  "inline-flex h-11 items-center rounded-full bg-ink px-[22px] text-[15px] font-semibold text-white hover:bg-navy-2";
