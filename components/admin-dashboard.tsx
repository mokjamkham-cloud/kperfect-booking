"use client";

import { BellRing, Loader2, RotateCw, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatThaiDate, formatTimeRange } from "@/lib/dates";
import type { BookingWithUser } from "@/lib/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState("confirmed");
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const confirmedSeats = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").reduce((sum, booking) => sum + booking.seats, 0),
    [bookings],
  );

  useEffect(() => {
    const storedKey = window.localStorage.getItem("kperfect-admin-key");
    if (storedKey) setAdminKey(storedKey);
  }, []);

  async function loadBookings(nextAdminKey = adminKey) {
    if (!nextAdminKey) {
      setMessage({ tone: "error", text: "กรุณาใส่ Admin API Key" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      window.localStorage.setItem("kperfect-admin-key", nextAdminKey);
      const result = await api.getAdminBookings({ date, status, adminKey: nextAdminKey });
      setBookings(result.bookings);
    } catch (error) {
      setBookings([]);
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "โหลด dashboard ไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!window.confirm("Admin ยืนยันยกเลิกคิวนี้หรือไม่")) return;

    try {
      await api.adminCancelBooking(bookingId, adminKey);
      await loadBookings();
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "ยกเลิกคิวไม่สำเร็จ" });
    }
  }

  async function sendSummary() {
    try {
      const result = await api.sendTodaySummary(adminKey);
      setMessage({ tone: result.sent ? "success" : "info", text: result.sent ? "ส่งสรุปคิววันนี้เข้า LINE Group แล้ว" : "ยังไม่ได้ตั้งค่า LINE Group ID" });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "ส่งสรุปไม่สำเร็จ" });
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader title="Admin Dashboard" description="ดูรายการจอง ยกเลิกคิว และส่งสรุปเข้ากลุ่ม LINE ของร้าน" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
          <Input
            label="Admin API Key"
            name="adminKey"
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="ค่าจาก ADMIN_API_KEY"
          />
          <Input label="วันที่" name="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Select label="สถานะ" name="status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
            <option value="all">ทั้งหมด</option>
          </Select>
          <div className="flex items-end gap-2">
            <Button type="button" onClick={() => loadBookings()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              ดูคิว
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500">วันที่</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatThaiDate(date)}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">จำนวนรายการ</p>
          <p className="mt-2 text-3xl font-black text-petal">{bookings.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">ที่นั่ง confirmed</p>
          <p className="mt-2 text-3xl font-black text-fern">{confirmedSeats}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">รายการคิว</h2>
            <p className="text-sm text-slate-600">เรียงตามเวลาเริ่มต้นของแต่ละคิว</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => loadBookings()} disabled={loading}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              รีเฟรช
            </Button>
            <Button type="button" variant="secondary" onClick={sendSummary} disabled={!adminKey}>
              <BellRing className="h-4 w-4" aria-hidden="true" />
              ส่งสรุปวันนี้
            </Button>
          </div>
        </div>

        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-fern" aria-hidden="true" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState title="ยังไม่มีรายการในช่วงที่เลือก" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-3 font-semibold">เวลา</th>
                  <th className="py-3 pr-3 font-semibold">ลูกค้า</th>
                  <th className="py-3 pr-3 font-semibold">โทร</th>
                  <th className="py-3 pr-3 font-semibold">ที่นั่ง</th>
                  <th className="py-3 pr-3 font-semibold">สถานะ</th>
                  <th className="py-3 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-3 font-semibold text-ink">{formatTimeRange(booking.startTime, booking.endTime)}</td>
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-ink">{booking.customerName}</div>
                      <div className="text-xs text-slate-500">{booking.displayName}</div>
                      {booking.notes ? <div className="mt-1 text-xs text-slate-500">{booking.notes}</div> : null}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">{booking.phone}</td>
                    <td className="py-3 pr-3 text-slate-700">{booking.seats}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 text-right">
                      {booking.status === "confirmed" ? (
                        <Button type="button" variant="danger" onClick={() => cancelBooking(booking.id)}>
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          ยกเลิก
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
