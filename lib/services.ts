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

export type BookingServiceName = (typeof BOOKING_SERVICES)[number];

export const DEFAULT_BOOKING_SERVICE: BookingServiceName = "ทาสีเล็บเจล";

export const BOOKING_SERVICE_GROUPS = [
  { label: "เล็บ", services: ["ทาสีเล็บเจล", "ทาสีเล็บธรรมดา", "เพ้นท์เล็บ", "ต่อเล็บ", "เติมโคนเล็บ", "ถอดเล็บ", "สปามือ/เท้า"] },
  { label: "ขนตา / คิ้ว", services: ["ต่อขนตา", "เติมขนตา", "ลิฟติ้งขนตา", "ย้อมขนตา/คิ้ว", "ถอดขนตา"] },
  { label: "อื่น ๆ", services: ["แวกซ์"] },
] satisfies { label: string; services: BookingServiceName[] }[];
