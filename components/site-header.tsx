import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ListChecks } from "lucide-react";
import { LoginButton } from "@/components/login-button";

const navItems = [
  { href: "/booking", label: "จองคิว", icon: CalendarDays },
  { href: "/my-bookings", label: "คิวของฉัน", icon: ListChecks },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-sm border border-ink bg-white">
              <Image src="/kperfect-logo.png" alt="K Perfect Nails & Spa" width={48} height={48} className="h-11 w-11 object-contain" priority />
            </span>
            <span className="grid gap-0.5">
              <span className="font-serif text-lg font-bold tracking-normal text-ink">K-perfect Nails & Spa</span>
              <span className="text-xs font-semibold uppercase tracking-normal text-fern">Nimman / Online Booking</span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-transparent px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-ink hover:bg-white hover:text-ink"
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
