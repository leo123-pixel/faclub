import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, actions }: { eyebrow?: ReactNode; title: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="text-sm text-muted">{eyebrow}</div>}
        <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-ink lg:text-[40px]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
