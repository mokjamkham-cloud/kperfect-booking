import type { Env } from "./env";

export type BookingConfig = {
  branchName: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  serviceDurationMinutes: number;
  slotIntervalMinutes: number;
  maxOnlineSeats: number;
  maxBookingsPerUser: number;
  maxAdvanceDays: number;
  allowSameDayBooking: boolean;
};

function numberFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanFromEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export function getBookingConfig(env: Env): BookingConfig {
  return {
    branchName: env.BRANCH_NAME || "K Perfect Nails - Nimman",
    timezone: env.SHOP_TIMEZONE || "Asia/Bangkok",
    openTime: env.SHOP_OPEN_TIME || "09:00",
    closeTime: env.SHOP_CLOSE_TIME || "20:00",
    serviceDurationMinutes: numberFromEnv(env.SERVICE_DURATION_MINUTES, 120),
    slotIntervalMinutes: numberFromEnv(env.SLOT_INTERVAL_MINUTES, 60),
    maxOnlineSeats: numberFromEnv(env.MAX_ONLINE_SEATS, 2),
    maxBookingsPerUser: numberFromEnv(env.MAX_BOOKINGS_PER_USER, 2),
    maxAdvanceDays: numberFromEnv(env.MAX_ADVANCE_DAYS, 7),
    allowSameDayBooking: booleanFromEnv(env.ALLOW_SAME_DAY_BOOKING, false),
  };
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function dateStringInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getBookingWindow(config: BookingConfig) {
  const today = dateStringInTimezone(new Date(), config.timezone);
  const minDate = addDays(today, config.allowSameDayBooking ? 0 : 1);
  const maxDate = addDays(today, config.maxAdvanceDays);
  return { today, minDate, maxDate };
}

export function generateTimeSlots(config: BookingConfig) {
  const slots: Array<{ startTime: string; endTime: string }> = [];
  const open = timeToMinutes(config.openTime);
  const close = timeToMinutes(config.closeTime);

  for (let start = open; start + config.serviceDurationMinutes <= close; start += config.slotIntervalMinutes) {
    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(start + config.serviceDurationMinutes),
    });
  }

  return slots;
}

export function isDateAllowed(date: string, config: BookingConfig) {
  const { minDate, maxDate } = getBookingWindow(config);
  return date >= minDate && date <= maxDate;
}

export function getBookingRetentionDays(env: Env) {
  return numberFromEnv(env.BOOKING_RETENTION_DAYS, 10);
}

export function getBookingRetentionCutoffDate(env: Env) {
  const timezone = env.SHOP_TIMEZONE || "Asia/Bangkok";
  const today = dateStringInTimezone(new Date(), timezone);
  return addDays(today, -getBookingRetentionDays(env));
}
