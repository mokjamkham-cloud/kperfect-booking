import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

export function Input({ className, label, helperText, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={cn(
          "min-h-11 rounded-md border border-stone-200 bg-white px-3 py-2 text-base outline-none transition placeholder:text-stone-400 focus:border-petal focus:ring-2 focus:ring-petal/15",
          className,
        )}
        {...props}
      />
      {helperText ? <span className="text-xs font-normal text-slate-500">{helperText}</span> : null}
    </label>
  );
}
