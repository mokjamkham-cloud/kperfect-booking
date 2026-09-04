import { generateTimeSlots, getBookingConfig, isDateAllowed } from "./config";
import {
  cancelBooking,
  countActiveUserBookings,
  createBooking,
  getBookingById,
  getOverlappingSeatCount,
  listUserBookings,
  updateUserContact,
} from "./db";
import type { Env } from "./env";
import { requireUser } from "./auth";
import { HttpError, jsonResponse, readJson } from "./http";
import { sendBookingConfirmation, sendBookingNoticeToGroup } from "./line";
import type { Slot } from "./types";

type BookingPayload = {
  bookingDate?: string;
  startTime?: string;
  seats?: number;
  customerName?: string;
  phone?: string;
  notes?: string;
};

function cleanText(value: string | undefined, maxLength: number) {
  return (value || "").trim().slice(0, maxLength);
}

function assertDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "กรุณาเลือกวันที่ให้ถูกต้อง");
  }
  return value;
}

function assertPhone(value: string | undefined) {
  const phone = cleanText(value, 30);
  if (!/^[0-9+\-\s()]{8,30}$/.test(phone)) {
    throw new HttpError(400, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
  }
  return phone;
}

async function buildSlots(env: Env, date: string): Promise<Slot[]> {
  const config = getBookingConfig(env);
  const timeSlots = generateTimeSlots(config);

  const slots: Slot[] = [];
  for (const slot of timeSlots) {
    const usedSeats = await getOverlappingSeatCount(env, date, slot.startTime, slot.endTime);
    const remainingSeats = Math.max(config.maxOnlineSeats - usedSeats, 0);
    slots.push({
      ...slot,
      remainingSeats,
      isAvailable: remainingSeats > 0,
    });
  }

  return slots;
}

export async function handleSlots(request: Request, env: Env) {
  const url = new URL(request.url);
  const date = assertDate(url.searchParams.get("date") || undefined);
  const config = getBookingConfig(env);

  if (!isDateAllowed(date, config)) {
    throw new HttpError(400, `ระบบรับจองล่วงหน้า 1-${config.maxAdvanceDays} วันเท่านั้น`);
  }

  const slots = await buildSlots(env, date);
  return jsonResponse({ slots }, request, env);
}

export async function handleCreateBooking(request: Request, env: Env, ctx: ExecutionContext) {
  const user = await requireUser(request, env);
  const config = getBookingConfig(env);
  const payload = await readJson<BookingPayload>(request);
  const bookingDate = assertDate(payload.bookingDate);
  const customerName = cleanText(payload.customerName, 80);
  const phone = assertPhone(payload.phone);
  const seats = Number(payload.seats || 1);

  if (!customerName) {
    throw new HttpError(400, "กรุณากรอกชื่อผู้จอง");
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > config.maxOnlineSeats) {
    throw new HttpError(400, `จองออนไลน์ได้สูงสุด ${config.maxOnlineSeats} ที่ต่อรายการ`);
  }

  if (!isDateAllowed(bookingDate, config)) {
    throw new HttpError(400, `ระบบรับจองล่วงหน้า 1-${config.maxAdvanceDays} วันเท่านั้น`);
  }

  const slot = generateTimeSlots(config).find((item) => item.startTime === payload.startTime);
  if (!slot) {
    throw new HttpError(400, "ช่วงเวลาที่เลือกไม่ถูกต้อง");
  }

  const activeCount = await countActiveUserBookings(env, user.id);
  if (activeCount >= config.maxBookingsPerUser) {
    throw new HttpError(409, `ลูกค้า 1 คนมีคิวที่ยืนยันแล้วได้สูงสุด ${config.maxBookingsPerUser} คิว`);
  }

  const usedSeats = await getOverlappingSeatCount(env, bookingDate, slot.startTime, slot.endTime);
  if (usedSeats + seats > config.maxOnlineSeats) {
    throw new HttpError(409, "ช่วงเวลานี้เต็มแล้ว กรุณาเลือกเวลาอื่น");
  }

  await updateUserContact(env, user.id, customerName, phone);

  const booking = await createBooking(env, {
    id: crypto.randomUUID(),
    userId: user.id,
    branchName: config.branchName,
    bookingDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    seats,
    customerName,
    phone,
    notes: cleanText(payload.notes, 300) || null,
  });

  ctx.waitUntil(
    Promise.allSettled([sendBookingConfirmation(env, user, booking), sendBookingNoticeToGroup(env, booking)]).then((results) => {
      for (const result of results) {
        if (result.status === "rejected") {
          console.error(
            JSON.stringify({
              event: "booking_notification_failed",
              reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
            }),
          );
        }
      }
    }),
  );

  return jsonResponse({ booking }, request, env, { status: 201 });
}

export async function handleMyBookings(request: Request, env: Env) {
  const user = await requireUser(request, env);
  const bookings = await listUserBookings(env, user.id);
  return jsonResponse({ bookings }, request, env);
}

export async function handleCancelMyBooking(request: Request, env: Env, bookingId: string) {
  const user = await requireUser(request, env);
  const booking = await getBookingById(env, bookingId);

  if (!booking) {
    throw new HttpError(404, "ไม่พบคิวนี้");
  }

  if (booking.userId !== user.id) {
    throw new HttpError(403, "ไม่สามารถจัดการคิวของผู้อื่นได้");
  }

  if (booking.status === "cancelled") {
    return jsonResponse({ booking }, request, env);
  }

  const cancelled = await cancelBooking(env, bookingId, "cancelled_by_customer");
  return jsonResponse({ booking: cancelled }, request, env);
}
