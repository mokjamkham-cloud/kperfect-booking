export const SHOP_CONFIG = {
  branchName: "K Perfect Nimman",
  timezone: "Asia/Bangkok",
  openTime: "09:00",
  closeTime: "20:00",
  serviceDurationMinutes: 120,
  slotIntervalMinutes: 60,
  maxOnlineSeats: 2,
  maxBookingsPerUser: 2,
  maxAdvanceDays: 7,
  allowSameDayBooking: false,
  phone: "053-000-000",
  lineOaName: "@kperfectnails",
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
