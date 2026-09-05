import { handleAdminBookings, handleAdminCancelBooking, handleNotifyToday, handlePurgeOldBookings } from "./admin";
import { handleDevLogin, handleLineCallback, handleLineLoginStart, handleLineLoginUrl, handleLogout, handleMe } from "./auth";
import { handleCancelMyBooking, handleCreateBooking, handleMyBookings, handleSlots } from "./bookings";
import { getBookingConfig } from "./config";
import type { Env } from "./env";
import { errorResponse, jsonResponse, notFound, optionsResponse } from "./http";
import { handleLineWebhook, sendDailySummary } from "./line";
import { purgeExpiredBookingData } from "./maintenance";

function matchBookingCancel(pathname: string) {
  return pathname.match(/^\/api\/bookings\/([^/]+)\/cancel$/)?.[1];
}

function matchAdminBookingCancel(pathname: string) {
  return pathname.match(/^\/api\/admin\/bookings\/([^/]+)\/cancel$/)?.[1];
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === "OPTIONS") {
      return optionsResponse(request, env);
    }

    try {
      const url = new URL(request.url);
      const { pathname } = url;

      if (request.method === "GET" && (pathname === "/" || pathname === "/api/health")) {
        return jsonResponse({ ok: true, service: "kperfect-booking-api" }, request, env);
      }

      if (request.method === "GET" && pathname === "/api/config") {
        return jsonResponse(getBookingConfig(env), request, env);
      }

      if (request.method === "GET" && pathname === "/api/me") {
        return await handleMe(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/url") {
        return await handleLineLoginUrl(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/start") {
        return await handleLineLoginStart(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/callback") {
        return await handleLineCallback(request, env);
      }

      if (request.method === "POST" && pathname === "/api/auth/dev-login") {
        return await handleDevLogin(request, env);
      }

      if (request.method === "POST" && pathname === "/api/auth/logout") {
        return await handleLogout(request, env);
      }

      if (request.method === "GET" && pathname === "/api/slots") {
        return await handleSlots(request, env);
      }

      if (request.method === "GET" && pathname === "/api/bookings") {
        return await handleMyBookings(request, env);
      }

      if (request.method === "POST" && pathname === "/api/bookings") {
        return await handleCreateBooking(request, env, ctx);
      }

      const bookingId = matchBookingCancel(pathname);
      if (request.method === "POST" && bookingId) {
        return await handleCancelMyBooking(request, env, ctx, decodeURIComponent(bookingId));
      }

      if (request.method === "GET" && pathname === "/api/admin/bookings") {
        return await handleAdminBookings(request, env);
      }

      const adminBookingId = matchAdminBookingCancel(pathname);
      if (request.method === "POST" && adminBookingId) {
        return await handleAdminCancelBooking(request, env, ctx, decodeURIComponent(adminBookingId));
      }

      if (request.method === "POST" && pathname === "/api/admin/notify-today") {
        return await handleNotifyToday(request, env);
      }

      if (request.method === "POST" && pathname === "/api/admin/purge-old-bookings") {
        return await handlePurgeOldBookings(request, env);
      }

      if (request.method === "POST" && pathname === "/api/line/webhook") {
        return await handleLineWebhook(request, env);
      }

      return notFound(request, env);
    } catch (error) {
      return errorResponse(error, request, env);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(Promise.allSettled([sendDailySummary(env), purgeExpiredBookingData(env)]));
  },
} satisfies ExportedHandler<Env>;
