export type BookingStatus = "confirmed" | "cancelled";

export type UserProfile = {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string | null;
  phone?: string | null;
};

export type Slot = {
  startTime: string;
  endTime: string;
  remainingSeats: number;
  isAvailable: boolean;
};

export type Booking = {
  id: string;
  userId: string;
  branchName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  seats: number;
  customerName: string;
  phone: string;
  notes?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingWithUser = Booking & {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string | null;
};

export type BookingPayload = {
  bookingDate: string;
  startTime: string;
  seats: number;
  customerName: string;
  phone: string;
  notes?: string;
};

export type AppConfig = {
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
