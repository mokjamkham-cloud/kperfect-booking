import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

const variants = {
  primary: "border border-ink bg-ink text-white hover:bg-black focus-visible:ring-ink",
  secondary: "border border-ink/30 bg-white text-ink hover:border-ink hover:bg-stone-50 focus-visible:ring-ink",
  ghost: "text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400",
  danger: "border border-red-700 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
