import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type NoticeProps = {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
};

const tones = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Notice({ tone = "info", children, className }: NoticeProps) {
  return <div className={cn("rounded-md border px-4 py-3 text-sm leading-6", tones[tone], className)}>{children}</div>;
}
