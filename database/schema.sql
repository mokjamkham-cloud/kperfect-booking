CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT,
  picture_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1 CHECK (seats BETWEEN 1 AND 2),
  service_name TEXT NOT NULL DEFAULT 'ทาสีเล็บเจล',
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  cancel_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings (booking_date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings (user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings (status, booking_date);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
