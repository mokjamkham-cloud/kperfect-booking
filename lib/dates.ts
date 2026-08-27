import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";
import { SHOP_CONFIG } from "@/lib/config";

export function minBookingDate() {
  const offset = SHOP_CONFIG.allowSameDayBooking ? 0 : 1;
  return format(addDays(new Date(), offset), "yyyy-MM-dd");
}

export function maxBookingDate() {
  return format(addDays(new Date(), SHOP_CONFIG.maxAdvanceDays), "yyyy-MM-dd");
}

export function formatThaiDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseISO(`${date}T00:00:00`));
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime} น.`;
}

export function isDateOutsideBookingWindow(date: string) {
  const value = parseISO(`${date}T00:00:00`);
  const min = parseISO(`${minBookingDate()}T00:00:00`);
  const max = parseISO(`${maxBookingDate()}T00:00:00`);
  return isBefore(value, min) || isAfter(value, max);
}
