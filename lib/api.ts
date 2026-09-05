import { API_BASE_URL } from "@/lib/config";
import type { AppConfig, Booking, BookingPayload, BookingWithUser, Slot, UserProfile } from "@/lib/types";

type RequestOptions = RequestInit & {
  adminKey?: string;
  adminUser?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.adminKey) {
    headers.set("x-admin-key", options.adminKey);
  }

  if (options.adminUser) {
    headers.set("Authorization", `Basic ${btoa(`${options.adminUser}:`)}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(body?.message || "ไม่สามารถติดต่อระบบได้", response.status);
  }

  return body as T;
}

export const api = {
  getConfig: () => request<AppConfig>("/api/config"),
  getMe: () => request<{ user: UserProfile | null }>("/api/me"),
  getLineLoginUrl: () => request<{ url: string }>("/api/auth/line/url"),
  devLogin: () => request<{ user: UserProfile }>("/api/auth/dev-login", { method: "POST" }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  getSlots: (date: string) => request<{ slots: Slot[] }>(`/api/slots?date=${encodeURIComponent(date)}`),
  createBooking: (payload: BookingPayload) =>
    request<{ booking: Booking }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyBookings: () => request<{ bookings: Booking[] }>("/api/bookings"),
  cancelBooking: (bookingId: string) =>
    request<{ booking: Booking }>(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "POST",
    }),
  getAdminBookings: (params: { date?: string; month?: string; status?: string; adminKey?: string; adminUser?: string }) => {
    const search = new URLSearchParams();
    if (params.date) search.set("date", params.date);
    if (params.month) search.set("month", params.month);
    if (params.status) search.set("status", params.status);
    return request<{ bookings: BookingWithUser[] }>(`/api/admin/bookings?${search.toString()}`, {
      adminKey: params.adminKey,
      adminUser: params.adminUser,
    });
  },
  adminCancelBooking: (bookingId: string, adminAuth: { adminKey?: string; adminUser?: string }) =>
    request<{ booking: Booking }>(`/api/admin/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "POST",
      ...adminAuth,
    }),
  sendTodaySummary: (adminAuth: { adminKey?: string; adminUser?: string }) =>
    request<{ ok: true; sent: boolean }>("/api/admin/notify-today", {
      method: "POST",
      ...adminAuth,
    }),
  purgeOldBookings: (adminAuth: { adminKey?: string; adminUser?: string }) =>
    request<{ ok: true; cutoffDate: string; deletedBookings: number; deletedUsers: number }>("/api/admin/purge-old-bookings", {
      method: "POST",
      ...adminAuth,
    }),
};
