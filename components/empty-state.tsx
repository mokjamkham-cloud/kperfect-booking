import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {children ? <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div> : null}
    </div>
  );
}
