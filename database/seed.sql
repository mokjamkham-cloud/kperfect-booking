INSERT OR IGNORE INTO users (id, line_user_id, display_name, phone, picture_url)
VALUES ('demo-user', 'demo-line-user', 'ลูกค้าทดลอง', '0800000000', NULL);

INSERT OR IGNORE INTO bookings (
  id,
  user_id,
  branch_name,
  booking_date,
  start_time,
  end_time,
  seats,
  customer_name,
  phone,
  notes,
  status
)
VALUES (
  'demo-booking',
  'demo-user',
  'K Perfect Nimman',
  date('now', '+1 day'),
  '11:00',
  '13:00',
  1,
  'ลูกค้าทดลอง',
  '0800000000',
  'ข้อมูลตัวอย่างสำหรับทดสอบระบบ',
  'confirmed'
);
