"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

export default function LoginCallbackPage() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = "/booking";
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12 sm:px-6">
      <Card>
        <CardHeader title="เข้าสู่ระบบสำเร็จ" description="กำลังพาไปหน้าจองคิว" />
        <CheckCircle2 className="mb-5 h-10 w-10 text-fern" aria-hidden="true" />
        <Link
          href="/booking"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-petal px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          ไปหน้าจองคิว
        </Link>
      </Card>
    </main>
  );
}
