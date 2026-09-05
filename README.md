# K Perfect Nails Online Booking

ระบบจองคิวออนไลน์สำหรับ **K Perfect Nails - Nimman** ใช้ Next.js 15 เป็น frontend, Cloudflare Workers เป็น API และ web hosting, Cloudflare D1 เป็นฐานข้อมูล, LINE Login สำหรับลูกค้า และ LINE Messaging API สำหรับแจ้งเตือนทีมร้าน

## Production URLs

- Website + API: `https://kperfect-booking-api.mokjamkham.workers.dev`
- Cloudflare Pages mirror: `https://kperfect-booking.pages.dev`
- LINE Login callback: `https://kperfect-booking-api.mokjamkham.workers.dev/api/auth/line/callback`
- LINE webhook: `https://kperfect-booking-api.mokjamkham.workers.dev/api/line/webhook`

แนะนำให้ใช้ URL หลักของ Worker สำหรับเว็บจริง เพราะ frontend และ API อยู่โดเมนเดียวกัน ทำให้ session cookie ของ LINE Login เสถียรกว่า และยังไม่ต้องซื้อ domain

## สิ่งที่ทำไว้ในโปรเจกต์

- Next.js 15 แบบ static export
- Cloudflare Worker API พร้อม CORS, session cookie, LINE Login callback และ admin key
- Cloudflare Workers Static Assets สำหรับเสิร์ฟหน้าเว็บจาก Worker เดียวกับ API
- Cloudflare D1 schema/migration สำหรับ users, bookings และ app settings
- Booking rules ฝั่ง backend: จองล่วงหน้า 1-7 วัน, ไม่รับ same-day, รอบละ 2 ชั่วโมง, online capacity 2 ที่, ลูกค้า 1 คนมี active booking ได้สูงสุด 2 คิว
- หน้า booking, my bookings, staff dashboard แยกที่ `/staff` และ responsive UI
- Dropdown เมนูบริการ: ทาสีเล็บเจล, ทาสีเล็บธรรมดา, สปามือ/เท้า, เพ้นท์เล็บ
- LINE Messaging API สำหรับแจ้งคิวใหม่/ยกเลิกคิว, ส่ง confirmation ให้ลูกค้า และ cron สรุปคิวประจำวันเข้า LINE Group
- Cron ล้าง booking เก่ากว่า `BOOKING_RETENTION_DAYS` วัน เพื่อลดข้อมูลค้างใน D1

## โครงสร้างหลัก

```txt
app/                  Next.js App Router pages
components/           UI และ feature components
lib/                  frontend API client, config, date helpers, types
worker/src/           Cloudflare Worker API
database/             D1 schema, migrations, seed data
scripts/              helper scripts สำหรับ build/deploy
wrangler.toml         Cloudflare Worker + Static Assets + D1 binding + cron config
```

## เตรียมเครื่อง local

ต้องมี Node.js 20+ แล้วติดตั้ง dependency:

```bash
npm install
```

สร้างไฟล์ `.env.local` สำหรับ Next.js local:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

สร้างไฟล์ `.dev.vars` ที่ root โปรเจกต์ สำหรับ Worker local:

```bash
APP_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
ADMIN_API_KEY=change-this-admin-key
ADMIN_USER=kperfect-staff
SESSION_SECRET=replace-with-at-least-32-random-characters
ENABLE_DEV_AUTH=true

LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
LINE_LOGIN_REDIRECT_URI=http://localhost:8787/api/auth/line/callback
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=
LINE_MESSAGING_CHANNEL_SECRET=
LINE_GROUP_ID=

BRANCH_NAME=K Perfect Nails - Nimman
SHOP_TIMEZONE=Asia/Bangkok
SHOP_OPEN_TIME=09:00
SHOP_CLOSE_TIME=20:00
SERVICE_DURATION_MINUTES=120
SLOT_INTERVAL_MINUTES=60
MAX_ONLINE_SEATS=2
MAX_BOOKINGS_PER_USER=2
MAX_ADVANCE_DAYS=7
ALLOW_SAME_DAY_BOOKING=false
BOOKING_RETENTION_DAYS=10
```

รัน D1 local migration และเปิด dev servers:

```bash
npm run db:migrate:local
npm run db:seed:local
npm run dev:worker
npm run dev
```

เข้าเว็บที่ `http://localhost:3000` แล้วใช้ปุ่ม `ทดลอง` เพื่อทดสอบก่อนตั้งค่า LINE จริง

## Deploy ทีละขั้น

### 1. Login Cloudflare

```bash
npx wrangler whoami
```

ถ้ายังไม่ได้ login:

```bash
npx wrangler login
```

ถ้า browser login ใช้ไม่ได้ ให้ใช้ device flow:

```bash
npx wrangler login --device --browser=false
```

### 2. สร้างหรือเช็ก Cloudflare D1

ตอนนี้ config ใช้ database นี้:

```txt
kperfect-booking-db
ded6edac-c92f-4ed8-b868-0d1dd20bf52c
```

ถ้ายังไม่มี database ให้สร้างใหม่ แล้วนำ `database_id` ที่ได้ไปใส่ใน `wrangler.toml`:

```bash
npx wrangler d1 create kperfect-booking-db
```

รัน migration บน Cloudflare:

```bash
npm run db:migrate:remote
```

### 3. ตั้งค่า Worker secrets

ใส่ secret ทีละตัว:

```bash
npx wrangler secret put ADMIN_API_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
npx wrangler secret put LINE_LOGIN_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_REDIRECT_URI
npx wrangler secret put LINE_MESSAGING_CHANNEL_ACCESS_TOKEN
npx wrangler secret put LINE_MESSAGING_CHANNEL_SECRET
npx wrangler secret put LINE_GROUP_ID
```

หน้า staff แบบไม่ใช้ password ใช้ค่า `ADMIN_USER` ใน `wrangler.toml` ค่าเริ่มต้นคือ:

```txt
kperfect-staff
```

ถ้าต้องการส่งเป็น token แบบ `user:` ให้ encode ค่า `kperfect-staff:` เป็น Base64 แล้วเปิด:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev/staff?token=a3BlcmZlY3Qtc3RhZmY6
```

ค่า `LINE_LOGIN_REDIRECT_URI` ต้องเป็น:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev/api/auth/line/callback
```

### 4. Deploy website + API ไป Cloudflare Workers

คำสั่งนี้จะ build Next.js ด้วย production URL แล้ว deploy ทั้งหน้าเว็บ static, Worker API, D1 binding และ cron:

```bash
npm run deploy:site
```

หลัง deploy เปิด:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev
```

หน้า staff:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev/staff
```

### 5. ตั้งค่า LINE Login

1. เข้า LINE Developers Console
2. เลือก LINE Login Channel
3. ใน Callback URL ใส่:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev/api/auth/line/callback
```

4. ตรวจว่า Channel ID และ Channel secret ตรงกับ Worker secrets
5. Scope ที่ใช้คือ `profile openid`

### 6. ตั้งค่า LINE Messaging API

1. เข้า LINE Developers Console
2. เลือก Messaging API Channel
3. เปิด Webhook และตั้ง Webhook URL:

```txt
https://kperfect-booking-api.mokjamkham.workers.dev/api/line/webhook
```

4. นำ Channel access token และ Channel secret ไปใส่ Worker secrets
5. เชิญ LINE Official Account เข้ากลุ่มร้าน
6. ส่งข้อความ `groupid` ในกลุ่มหนึ่งครั้ง ระบบจะบันทึก group id ลง D1 อัตโนมัติ

## API หลัก

| Method | Path | ใช้ทำอะไร |
| --- | --- | --- |
| GET | `/api/config` | อ่าน config ร้าน |
| GET | `/api/auth/line/start` | เริ่ม LINE Login แบบ redirect |
| GET | `/api/auth/line/url` | สร้าง LINE Login URL แบบ JSON |
| GET | `/api/auth/line/callback` | รับ callback จาก LINE |
| POST | `/api/auth/dev-login` | login ทดลองเฉพาะ local |
| GET | `/api/me` | อ่าน user session |
| GET | `/api/slots?date=YYYY-MM-DD` | ดูช่วงเวลาว่าง |
| GET | `/api/bookings` | ดูคิวของลูกค้า |
| POST | `/api/bookings` | สร้าง booking |
| POST | `/api/bookings/:id/cancel` | ลูกค้ายกเลิกคิว |
| GET | `/api/admin/bookings?month=YYYY-MM` | staff ดูคิวรายเดือน |
| POST | `/api/admin/bookings/:id/cancel` | admin ยกเลิกคิว |
| POST | `/api/admin/notify-today` | ส่งสรุปคิววันนี้เข้า LINE Group |
| POST | `/api/admin/purge-old-bookings` | ล้าง booking เก่ากว่า retention |
| POST | `/api/line/webhook` | รับ webhook จาก LINE |

## ตรวจคุณภาพก่อน deploy

```bash
npm run typecheck
npm run build:cloudflare
```

## หมายเหตุเรื่องค่าใช้จ่าย

Cloudflare Workers Free มีโควตา request รายวัน และ D1 Free มีโควตา rows read/write กับ storage ที่เหมาะกับเว็บจองร้านเล็กช่วงเริ่มต้น ถ้า traffic โตมากจนเกิน free quota ระบบจะเริ่มตอบ error ตาม limit ของ Cloudflare

## เอกสารอ้างอิง

- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare D1 + Wrangler: https://developers.cloudflare.com/d1/wrangler-commands/
- LINE Login web app: https://developers.line.biz/en/docs/line-login/integrate-line-login/
- LINE Messaging API sending messages: https://developers.line.biz/en/docs/messaging-api/sending-messages/
