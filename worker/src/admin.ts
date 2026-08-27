import { cancelBooking, getBookingById, listAdminBookings } from "./db";
import type { Env } from "./env";
import { HttpError, jsonResponse } from "./http";
import { sendDailySummary } from "./line";

function requireAdmin(request: Request, env: Env) {
  const adminKey = request.headers.get("x-admin-key");
  if (!env.ADMIN_API_KEY || !adminKey || adminKey !== env.ADMIN_API_KEY) {
    throw new HttpError(401, "Admin API Key ไม่ถูกต้อง");
  }
}

export async function handleAdminBookings(request: Request, env: Env) {
  requireAdmin(request, env);
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || undefined;
  const status = url.searchParams.get("status") || "confirmed";
  const bookings = await listAdminBookings(env, { date, status });
  return jsonResponse({ bookings }, request, env);
}

export async function handleAdminCancelBooking(request: Request, env: Env, bookingId: string) {
  requireAdmin(request, env);
  const booking = await getBookingById(env, bookingId);

  if (!booking) {
    throw new HttpError(404, "ไม่พบคิวนี้");
  }

  if (booking.status === "cancelled") {
    return jsonResponse({ booking }, request, env);
  }

  const cancelled = await cancelBooking(env, bookingId, "cancelled_by_admin");
  return jsonResponse({ booking: cancelled }, request, env);
}

export async function handleNotifyToday(request: Request, env: Env) {
  requireAdmin(request, env);
  const sent = await sendDailySummary(env);
  return jsonResponse({ ok: true, sent }, request, env);
}
