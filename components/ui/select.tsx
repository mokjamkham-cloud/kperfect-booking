import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function Select({ className, label, children, id, ...props }: SelectProps) {
  const selectId = id || props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor={selectId}>
      <span>{label}</span>
      <select
        id={selectId}
        className={cn(
          "min-h-11 rounded-md border border-stone-200 bg-white px-3 py-2 text-base outline-none transition focus:border-petal focus:ring-2 focus:ring-petal/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
