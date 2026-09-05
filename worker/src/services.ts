export const BOOKING_SERVICES = [
  "ทาสีเล็บเจล",
  "ทาสีเล็บธรรมดา",
  "เพ้นท์เล็บ",
  "ต่อเล็บ",
  "เติมโคนเล็บ",
  "ต่อขนตา",
  "เติมขนตา",
  "ลิฟติ้งขนตา",
  "ย้อมขนตา/คิ้ว",
  "ถอดเล็บ",
  "ถอดขนตา",
  "สปามือ/เท้า",
  "แวกซ์",
] as const;

export function normalizeBookingService(value: string | undefined) {
  const cleaned = (value || "").trim();
  return BOOKING_SERVICES.find((service) => service === cleaned) || null;
}
