import { handleAdminBookings, handleAdminCancelBooking, handleNotifyToday } from "./admin";
import { handleDevLogin, handleLineCallback, handleLineLoginStart, handleLineLoginUrl, handleLogout, handleMe } from "./auth";
import { handleCancelMyBooking, handleCreateBooking, handleMyBookings, handleSlots } from "./bookings";
import { getBookingConfig } from "./config";
import type { Env } from "./env";
import { errorResponse, jsonResponse, notFound, optionsResponse } from "./http";
import { handleLineWebhook, sendDailySummary } from "./line";

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
        return handleMe(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/url") {
        return handleLineLoginUrl(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/start") {
        return handleLineLoginStart(request, env);
      }

      if (request.method === "GET" && pathname === "/api/auth/line/callback") {
        return handleLineCallback(request, env);
      }

      if (request.method === "POST" && pathname === "/api/auth/dev-login") {
        return handleDevLogin(request, env);
      }

      if (request.method === "POST" && pathname === "/api/auth/logout") {
        return handleLogout(request, env);
      }

      if (request.method === "GET" && pathname === "/api/slots") {
        return handleSlots(request, env);
      }

      if (request.method === "GET" && pathname === "/api/bookings") {
        return handleMyBookings(request, env);
      }

      if (request.method === "POST" && pathname === "/api/bookings") {
        return handleCreateBooking(request, env, ctx);
      }

      const bookingId = matchBookingCancel(pathname);
      if (request.method === "POST" && bookingId) {
        return handleCancelMyBooking(request, env, decodeURIComponent(bookingId));
      }

      if (request.method === "GET" && pathname === "/api/admin/bookings") {
        return handleAdminBookings(request, env);
      }

      const adminBookingId = matchAdminBookingCancel(pathname);
      if (request.method === "POST" && adminBookingId) {
        return handleAdminCancelBooking(request, env, decodeURIComponent(adminBookingId));
      }

      if (request.method === "POST" && pathname === "/api/admin/notify-today") {
        return handleNotifyToday(request, env);
      }

      if (request.method === "POST" && pathname === "/api/line/webhook") {
        return handleLineWebhook(request, env);
      }

      return notFound(request, env);
    } catch (error) {
      return errorResponse(error, request, env);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(sendDailySummary(env));
  },
} satisfies ExportedHandler<Env>;
