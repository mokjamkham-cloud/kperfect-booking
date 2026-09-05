"use client";

import { BellRing, Loader2, RotateCw, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatTimeRange } from "@/lib/dates";
import type { BookingWithUser } from "@/lib/types";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function decodeBasicUserToken(token: string | null) {
  if (!token) return "";

  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = window.atob(padded);
    const separatorIndex = decoded.indexOf(":");
    return separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
  } catch {
    return "";
  }
}

function readUserFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user") || decodeBasicUserToken(params.get("token"));
}

export function AdminDashboard() {
  const [adminUser, setAdminUser] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState("confirmed");
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const confirmedSeats = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").reduce((sum, booking) => sum + booking.seats, 0),
    [bookings],
  );

  useEffect(() => {
    const userFromUrl = readUserFromUrl();
    const storedUser = window.localStorage.getItem("kperfect-admin-user");
    const nextUser = userFromUrl || storedUser || "";
    if (nextUser) {
      setAdminUser(nextUser);
      void loadBookings(nextUser);
    }
  }, []);

  function adminAuth(nextAdminUser = adminUser) {
    return { adminUser: nextAdminUser };
  }

  async function loadBookings(nextAdminUser = adminUser) {
    if (!nextAdminUser) {
      setMessage({ tone: "error", text: "กรุณาใส่ Staff user" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      window.localStorage.setItem("kperfect-admin-user", nextAdminUser);
      const result = await api.getAdminBookings({ month, status, ...adminAuth(nextAdminUser) });
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
      await api.adminCancelBooking(bookingId, adminAuth());
      await loadBookings();
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "ยกเลิกคิวไม่สำเร็จ" });
    }
  }

  async function sendSummary() {
    try {
      const result = await api.sendTodaySummary(adminAuth());
      setMessage({ tone: result.sent ? "success" : "info", text: result.sent ? "ส่งสรุปคิววันนี้เข้า LINE Group แล้ว" : "ยังไม่ได้ตั้งค่า LINE Group ID" });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "ส่งสรุปไม่สำเร็จ" });
    }
  }

  async function purgeOldBookings() {
    if (!window.confirm("ล้างข้อมูล booking เก่ากว่า retention 10 วันหรือไม่")) return;

    try {
      const result = await api.purgeOldBookings(adminAuth());
      setMessage({
        tone: "success",
        text: `ล้างข้อมูลเก่าก่อนวันที่ ${result.cutoffDate} แล้ว: booking ${result.deletedBookings} รายการ, user เก่า ${result.deletedUsers} คน`,
      });
      await loadBookings();
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "ล้างข้อมูลเก่าไม่สำเร็จ" });
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader title="Staff Dashboard" description="ดูรายการจองรายเดือน ยกเลิกคิว ส่งสรุป และล้างข้อมูลเก่าของร้าน" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
          <Input
            label="Staff user"
            name="adminUser"
            value={adminUser}
            onChange={(event) => setAdminUser(event.target.value)}
            placeholder="เช่น kperfect-staff"
          />
          <Input label="เดือน" name="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
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
          <p className="text-sm font-semibold text-slate-500">เดือน</p>
          <p className="mt-2 text-2xl font-black text-ink">{month}</p>
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
            <Button type="button" variant="secondary" onClick={sendSummary} disabled={!adminUser}>
              <BellRing className="h-4 w-4" aria-hidden="true" />
              ส่งสรุปวันนี้
            </Button>
            <Button type="button" variant="secondary" onClick={purgeOldBookings} disabled={!adminUser}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              ล้างข้อมูลเก่า
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
                  <th className="py-3 pr-3 font-semibold">บริการ</th>
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
                    <td className="py-3 pr-3 font-semibold text-fern">{booking.serviceName}</td>
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
