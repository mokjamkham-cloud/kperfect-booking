import type { Env } from "./env";
import type { Booking, BookingStatus, BookingWithUser, DbBookingRow, DbUserRow, LineProfile, UserProfile } from "./types";

export function mapUser(row: DbUserRow): UserProfile {
  return {
    id: row.id,
    lineUserId: row.line_user_id,
    displayName: row.display_name,
    phone: row.phone,
    pictureUrl: row.picture_url,
  };
}

export function mapBooking(row: DbBookingRow): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    branchName: row.branch_name,
    bookingDate: row.booking_date,
    startTime: row.start_time,
    endTime: row.end_time,
    seats: row.seats,
    customerName: row.customer_name,
    phone: row.phone,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBookingWithUser(row: DbBookingRow): BookingWithUser {
  return {
    ...mapBooking(row),
    lineUserId: row.line_user_id || "",
    displayName: row.display_name || "",
    pictureUrl: row.picture_url || null,
  };
}

export async function getUserById(env: Env, id: string) {
  const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<DbUserRow>();
  return row ? mapUser(row) : null;
}

export async function upsertLineUser(env: Env, profile: LineProfile) {
  const existing = await env.DB.prepare("SELECT * FROM users WHERE line_user_id = ?").bind(profile.userId).first<DbUserRow>();

  if (existing) {
    await env.DB.prepare(
      "UPDATE users SET display_name = ?, picture_url = ?, updated_at = datetime('now') WHERE line_user_id = ?",
    )
      .bind(profile.displayName, profile.pictureUrl || null, profile.userId)
      .run();
    return getUserById(env, existing.id);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO users (id, line_user_id, display_name, picture_url) VALUES (?, ?, ?, ?)",
  )
    .bind(id, profile.userId, profile.displayName, profile.pictureUrl || null)
    .run();

  return getUserById(env, id);
}

export async function updateUserContact(env: Env, userId: string, displayName: string, phone: string) {
  await env.DB.prepare("UPDATE users SET display_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(displayName, phone, userId)
    .run();
}

export async function countActiveUserBookings(env: Env, userId: string) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM bookings WHERE user_id = ? AND status = 'confirmed'")
    .bind(userId)
    .first<{ count: number }>();
  return row?.count || 0;
}

export async function getOverlappingSeatCount(env: Env, date: string, startTime: string, endTime: string) {
  const row = await env.DB.prepare(
    "SELECT COALESCE(SUM(seats), 0) AS seats FROM bookings WHERE booking_date = ? AND status = 'confirmed' AND start_time < ? AND end_time > ?",
  )
    .bind(date, endTime, startTime)
    .first<{ seats: number }>();
  return row?.seats || 0;
}

export async function createBooking(
  env: Env,
  booking: Omit<Booking, "createdAt" | "updatedAt" | "status"> & { status?: BookingStatus },
) {
  await env.DB.prepare(
    `INSERT INTO bookings (
      id, user_id, branch_name, booking_date, start_time, end_time, seats, customer_name, phone, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      booking.id,
      booking.userId,
      booking.branchName,
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.seats,
      booking.customerName,
      booking.phone,
      booking.notes,
      booking.status || "confirmed",
    )
    .run();

  const saved = await getBookingById(env, booking.id);
  if (!saved) throw new Error("Booking was not saved");
  return saved;
}

export async function listUserBookings(env: Env, userId: string) {
  const result = await env.DB.prepare(
    "SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, start_time DESC",
  )
    .bind(userId)
    .all<DbBookingRow>();
  return (result.results || []).map(mapBooking);
}

export async function getBookingById(env: Env, bookingId: string) {
  const row = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(bookingId).first<DbBookingRow>();
  return row ? mapBooking(row) : null;
}

export async function cancelBooking(env: Env, bookingId: string, reason: string) {
  await env.DB.prepare("UPDATE bookings SET status = 'cancelled', cancel_reason = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(reason, bookingId)
    .run();
  return getBookingById(env, bookingId);
}

export async function listAdminBookings(env: Env, params: { date?: string; status?: string }) {
  const conditions: string[] = [];
  const values: string[] = [];

  if (params.date) {
    conditions.push("b.booking_date = ?");
    values.push(params.date);
  }

  if (params.status && params.status !== "all") {
    conditions.push("b.status = ?");
    values.push(params.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await env.DB.prepare(
    `SELECT b.*, u.line_user_id, u.display_name, u.picture_url
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     ${where}
     ORDER BY b.booking_date ASC, b.start_time ASC`,
  )
    .bind(...values)
    .all<DbBookingRow>();

  return (result.results || []).map(mapBookingWithUser);
}

export async function getSetting(env: Env, key: string) {
  const row = await env.DB.prepare("SELECT value FROM app_settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row?.value || null;
}

export async function setSetting(env: Env, key: string, value: string) {
  await env.DB.prepare(
    "INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
  )
    .bind(key, value)
    .run();
}
