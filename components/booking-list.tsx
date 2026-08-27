"use client";

import { Loader2, RotateCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { api } from "@/lib/api";
import { formatThaiDate, formatTimeRange } from "@/lib/dates";
import type { Booking, UserProfile } from "@/lib/types";

export function BookingList() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadBookings() {
    setLoading(true);
    setMessage("");

    try {
      const me = await api.getMe();
      setUser(me.user);

      if (me.user) {
        const result = await api.getMyBookings();
        setBookings(result.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(bookingId: string) {
    if (!window.confirm("ยืนยันยกเลิกคิวนี้หรือไม่")) return;

    try {
      await api.cancelBooking(bookingId);
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ยกเลิกคิวไม่สำเร็จ");
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader title="คิวของฉัน" description="รายการจองของบัญชี LINE ที่เข้าสู่ระบบอยู่" />
        <Button type="button" variant="secondary" onClick={loadBookings}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          รีเฟรช
        </Button>
      </div>

      {message ? <Notice tone="error">{message}</Notice> : null}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-fern" aria-hidden="true" />
        </div>
      ) : !user ? (
        <EmptyState title="ยังไม่ได้เข้าสู่ระบบ">เข้าสู่ระบบด้วย LINE เพื่อดูและยกเลิกคิวของคุณ</EmptyState>
      ) : bookings.length === 0 ? (
        <EmptyState title="ยังไม่มีคิว">เมื่อจองสำเร็จ รายการจะแสดงที่หน้านี้</EmptyState>
      ) : (
        <div className="grid gap-3">
          {bookings.map((booking) => (
            <article key={booking.id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">{formatThaiDate(booking.bookingDate)}</h2>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm font-semibold text-slate-700">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                <p className="text-sm text-slate-600">
                  {booking.customerName} · {booking.phone} · {booking.seats} ที่
                </p>
                {booking.notes ? <p className="text-sm text-slate-500">{booking.notes}</p> : null}
              </div>

              {booking.status === "confirmed" ? (
                <Button type="button" variant="danger" onClick={() => cancelBooking(booking.id)}>
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  ยกเลิก
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
