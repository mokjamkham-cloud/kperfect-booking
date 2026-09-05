import { cancelBooking, getBookingWithUserById, listAdminBookings } from "./db";
import type { Env } from "./env";
import { HttpError, jsonResponse } from "./http";
import { sendBookingCancellationNoticeToGroup, sendBookingCancellationToUser, sendDailySummary } from "./line";
import { purgeExpiredBookingData } from "./maintenance";
import { timingSafeEqual } from "./security";

function requireAdmin(request: Request, env: Env) {
  const adminKey = request.headers.get("x-admin-key");
  if (env.ADMIN_API_KEY && adminKey && timingSafeEqual(adminKey, env.ADMIN_API_KEY)) {
    return;
  }

  const adminUser = readBasicAdminUser(request.headers.get("authorization"));
  const expectedAdminUser = env.ADMIN_USER || "kperfect-staff";

  if (adminUser && timingSafeEqual(adminUser, expectedAdminUser)) {
    return;
  }

  throw new HttpError(401, "สิทธิ์ผู้ดูแลไม่ถูกต้อง");
}

function readBasicAdminUser(authorization: string | null) {
  const match = authorization?.match(/^Basic\s+(.+)$/i);
  if (!match) return null;

  try {
    const decoded = atob(match[1]);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return null;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return password === "" ? username : null;
  } catch {
    return null;
  }
}

export async function handleAdminBookings(request: Request, env: Env) {
  requireAdmin(request, env);
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || undefined;
  const month = url.searchParams.get("month") || undefined;
  const status = url.searchParams.get("status") || "confirmed";
  const bookings = await listAdminBookings(env, { date, month, status });
  return jsonResponse({ bookings }, request, env);
}

export async function handleAdminCancelBooking(request: Request, env: Env, ctx: ExecutionContext, bookingId: string) {
  requireAdmin(request, env);
  const booking = await getBookingWithUserById(env, bookingId);

  if (!booking) {
    throw new HttpError(404, "ไม่พบคิวนี้");
  }

  if (booking.status === "cancelled") {
    return jsonResponse({ booking }, request, env);
  }

  const cancelled = await cancelBooking(env, bookingId, "cancelled_by_admin");
  if (!cancelled) throw new HttpError(500, "ยกเลิกคิวไม่สำเร็จ");

  const cancelledWithUser = {
    ...booking,
    ...cancelled,
  };

  ctx.waitUntil(
    Promise.allSettled([
      sendBookingCancellationToUser(env, cancelledWithUser, "ทีมงาน"),
      sendBookingCancellationNoticeToGroup(env, cancelledWithUser, "ทีมงาน"),
    ]).then(logNotificationFailures),
  );

  return jsonResponse({ booking: cancelled }, request, env);
}

export async function handleNotifyToday(request: Request, env: Env) {
  requireAdmin(request, env);
  const sent = await sendDailySummary(env);
  return jsonResponse({ ok: true, sent }, request, env);
}

export async function handlePurgeOldBookings(request: Request, env: Env) {
  requireAdmin(request, env);
  const result = await purgeExpiredBookingData(env);
  return jsonResponse({ ok: true, ...result }, request, env);
}

function logNotificationFailures(results: PromiseSettledResult<unknown>[]) {
  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        JSON.stringify({
          event: "booking_cancellation_notification_failed",
          reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
        }),
      );
    }
  }
}
