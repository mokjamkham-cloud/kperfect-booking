export type BookingStatus = "confirmed" | "cancelled";

export type UserProfile = {
  id: string;
  lineUserId: string;
  displayName: string;
  phone: string | null;
  pictureUrl: string | null;
};

export type Booking = {
  id: string;
  userId: string;
  branchName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  seats: number;
  serviceName: string;
  customerName: string;
  phone: string;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingWithUser = Booking & {
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
};

export type Slot = {
  startTime: string;
  endTime: string;
  remainingSeats: number;
  isAvailable: boolean;
};

export type DbUserRow = {
  id: string;
  line_user_id: string;
  display_name: string;
  phone: string | null;
  picture_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DbBookingRow = {
  id: string;
  user_id: string;
  branch_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  seats: number;
  service_name: string | null;
  customer_name: string;
  phone: string;
  notes: string | null;
  status: BookingStatus;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  line_user_id?: string;
  display_name?: string;
  picture_url?: string | null;
};

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};
