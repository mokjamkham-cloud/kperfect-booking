import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function Select({ className, label, children, id, ...props }: SelectProps) {
  const selectId = id || props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-stone-800" htmlFor={selectId}>
      <span>{label}</span>
      <select
        id={selectId}
        className={cn(
          "min-h-11 rounded-sm border border-ink/25 bg-white px-3 py-2 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
