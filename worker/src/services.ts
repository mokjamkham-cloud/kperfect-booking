export const BOOKING_SERVICES = ["ทาสีเล็บเจล", "ทาสีเล็บธรรมดา", "สปามือ/เท้า", "เพ้นท์เล็บ"] as const;

export function normalizeBookingService(value: string | undefined) {
  const cleaned = (value || "").trim();
  return BOOKING_SERVICES.find((service) => service === cleaned) || null;
}
