import Link from "next/link";
import { CalendarDays, ListChecks } from "lucide-react";
import { LoginButton } from "@/components/login-button";

const navItems = [
  { href: "/booking", label: "จองคิว", icon: CalendarDays },
  { href: "/my-bookings", label: "คิวของฉัน", icon: ListChecks },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="grid gap-0.5">
            <span className="text-lg font-black tracking-normal text-ink">K Perfect Nails - Nimman</span>
            <span className="text-xs font-semibold uppercase tracking-normal text-fern">จองสาขาอื่นต้องโทรจอง</span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-rose-50 hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <LoginButton />
      </div>
    </header>
  );
}
