ALTER TABLE bookings ADD COLUMN service_name TEXT;

UPDATE bookings
SET service_name = 'ทาสีเล็บเจล'
WHERE service_name IS NULL OR service_name = '';

CREATE INDEX IF NOT EXISTS idx_bookings_month_status ON bookings (booking_date, status);
