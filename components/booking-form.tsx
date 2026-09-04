"use client";

import { CalendarCheck, Loader2, PhoneCall } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AvailabilityGrid } from "@/components/availability-grid";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { maxBookingDate, minBookingDate } from "@/lib/dates";
import type { Slot, UserProfile } from "@/lib/types";

export function BookingForm() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [bookingDate, setBookingDate] = useState(minBookingDate());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.startTime === startTime), [slots, startTime]);

  useEffect(() => {
    api
      .getMe()
      .then((result) => {
        setUser(result.user);
        setCustomerName(result.user?.displayName || "");
        setPhone(result.user?.phone || "");
      })
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingSlots(true);
    setMessage(null);

    api
      .getSlots(bookingDate)
      .then((result) => {
        if (!active) return;
        setSlots(result.slots);
        const firstAvailable = result.slots.find((slot) => slot.isAvailable);
        setStartTime(firstAvailable?.startTime || "");
      })
      .catch((error) => {
        if (!active) return;
        setSlots([]);
        setStartTime("");
        setMessage({ tone: "error", text: error instanceof Error ? error.message : "โหลดเวลาว่างไม่สำเร็จ" });
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [bookingDate]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const result = await api.createBooking({
        bookingDate,
        startTime,
        seats,
        customerName,
        phone,
        notes,
      });
      setMessage({
        tone: "success",
        text: `จองสำเร็จ ${result.booking.bookingDate} เวลา ${result.booking.startTime} น.`,
      });
      const refreshed = await api.getSlots(bookingDate);
      setSlots(refreshed.slots);
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "จองคิวไม่สำเร็จ" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <Card>
        <CardHeader title="กำลังเตรียมหน้าจองคิว" description="ระบบกำลังตรวจสอบสถานะการเข้าสู่ระบบ" />
      </Card>
    );
  }

  if (!user) {
    return (
        <Card>
          <CardHeader title="กรุณาเข้าสู่ระบบก่อนจอง" description="ระบบรับจองออนไลน์ผ่าน LINE Login เพื่อผูกคิวกับบัญชีลูกค้า" />
          <Notice tone="info">ใช้ปุ่ม LINE Login ด้านบนเพื่อเข้าสู่ระบบก่อนจองคิว</Notice>
        </Card>
    );
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" onSubmit={submitBooking}>
      <Card className="grid gap-5">
        <CardHeader title="เลือกวันและเวลา" description="รับจองล่วงหน้า 1-7 วัน รอบละ 2 ชั่วโมง และเปิดออนไลน์สูงสุด 2 ที่ต่อช่วงเวลา" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="วันที่"
            name="bookingDate"
            type="date"
            min={minBookingDate()}
            max={maxBookingDate()}
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
            required
          />
          <Select label="จำนวนที่นั่ง" name="seats" value={seats} onChange={(event) => setSeats(Number(event.target.value))}>
            <option value={1}>1 ที่</option>
            <option value={2}>2 ที่</option>
          </Select>
        </div>

        {loadingSlots ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <Loader2 className="h-5 w-5 animate-spin text-fern" aria-hidden="true" />
          </div>
        ) : (
          <AvailabilityGrid slots={slots} selectedStartTime={startTime} onSelect={(slot) => setStartTime(slot.startTime)} />
        )}

        {selectedSlot ? (
          <Notice tone="info">ช่วงเวลาที่เลือก {selectedSlot.startTime} - {selectedSlot.endTime} น.</Notice>
        ) : (
          <Notice tone="warning">วันนี้ไม่มีช่วงเวลาที่ว่างสำหรับจำนวนที่นั่งที่เลือก</Notice>
        )}
      </Card>

      <Card className="h-fit">
        <CardHeader title="ข้อมูลผู้จอง" description="ใช้สำหรับยืนยันคิวและติดต่อกลับจากสาขานิมมาน" />
        <div className="grid gap-4">
          <Input label="ชื่อผู้จอง" name="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
          <Input
            label="เบอร์โทรศัพท์"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            helperText="ตัวอย่าง 0812345678"
          />
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="notes">
            <span>หมายเหตุ</span>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-base outline-none transition focus:border-fern focus:ring-2 focus:ring-fern/15"
            />
          </label>

          {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

          <Button type="submit" disabled={submitting || !selectedSlot}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CalendarCheck className="h-4 w-4" aria-hidden="true" />}
            ยืนยันการจอง
          </Button>

          <a className="inline-flex items-center gap-2 text-sm font-semibold text-fern" href="tel:053000000">
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            จองวันนี้กรุณาโทรที่ร้าน
          </a>
        </div>
      </Card>
    </form>
  );
}
