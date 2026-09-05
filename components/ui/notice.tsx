import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type NoticeProps = {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
};

const tones = {
  info: "border-stone-200 bg-stone-50 text-stone-900",
  success: "border-ink/20 bg-white text-ink",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Notice({ tone = "info", children, className }: NoticeProps) {
  return <div className={cn("rounded-sm border px-4 py-3 text-sm leading-6", tones[tone], className)}>{children}</div>;
}
