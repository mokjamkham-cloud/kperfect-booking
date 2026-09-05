import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-sm border border-ink/20 bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 grid gap-1">
      <h2 className="font-serif text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="text-sm leading-6 text-stone-600">{description}</p> : null}
    </div>
  );
}
