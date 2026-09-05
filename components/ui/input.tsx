import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

export function Input({ className, label, helperText, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-stone-800" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={cn(
          "min-h-11 rounded-sm border border-ink/25 bg-white px-3 py-2 text-base outline-none transition placeholder:text-stone-400 focus:border-ink focus:ring-2 focus:ring-ink/10",
          className,
        )}
        {...props}
      />
      {helperText ? <span className="text-xs font-normal text-stone-500">{helperText}</span> : null}
    </label>
  );
}
