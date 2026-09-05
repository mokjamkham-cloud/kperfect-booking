export const BOOKING_SERVICES = ["ทาสีเล็บเจล", "ทาสีเล็บธรรมดา", "สปามือ/เท้า", "เพ้นท์เล็บ"] as const;

export type BookingServiceName = (typeof BOOKING_SERVICES)[number];

export const DEFAULT_BOOKING_SERVICE: BookingServiceName = "ทาสีเล็บเจล";
