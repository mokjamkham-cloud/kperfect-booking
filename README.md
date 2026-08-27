<<<<<<< HEAD
# K Perfect Nails Online Booking

ระบบจองคิวออนไลน์สำหรับ **K Perfect Nails and Spa สาขา K Perfect Nimman** ใช้ Next.js 15 เป็น frontend, Cloudflare Workers เป็น API, Cloudflare D1 เป็นฐานข้อมูล, LINE Login สำหรับลูกค้า และ LINE Messaging API สำหรับแจ้งเตือนทีมร้าน

## สิ่งที่ทำไว้ในโปรเจกต์

- Next.js 15 แบบ static export สำหรับ Cloudflare Pages
- Cloudflare Worker API พร้อม CORS, session cookie, LINE Login callback และ admin key
- Cloudflare D1 schema/migration สำหรับ users, bookings และ app settings
- Booking rules ฝั่ง backend: จองล่วงหน้า 1-7 วัน, ไม่รับ same-day, รอบละ 2 ชั่วโมง, online capacity 2 ที่, ลูกค้า 1 คนมี active booking ได้สูงสุด 2 คิว
- หน้า booking, my bookings, admin dashboard และ responsive UI
- LINE Messaging API สำหรับแจ้งคิวใหม่, ส่ง confirmation ให้ลูกค้า และ cron สรุปคิวประจำวันเข้า LINE Group

## โครงสร้างหลัก

```txt
app/                  Next.js App Router pages
components/           UI และ feature components
lib/                  frontend API client, config, date helpers, types
worker/src/           Cloudflare Worker API
database/             D1 schema, migrations, seed data
wrangler.toml         Cloudflare Worker + D1 binding + cron config
```

## เตรียมเครื่อง local

ต้องมี Node.js 20+ และ Cloudflare Wrangler ผ่าน dependency ของโปรเจกต์

```bash
npm install
```

สร้างไฟล์ `.env.local` สำหรับ Next.js:

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
SESSION_SECRET=replace-with-at-least-32-random-characters
ENABLE_DEV_AUTH=true

LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
LINE_LOGIN_REDIRECT_URI=http://localhost:8787/api/auth/line/callback
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=
LINE_MESSAGING_CHANNEL_SECRET=
LINE_GROUP_ID=

BRANCH_NAME=K Perfect Nimman
SHOP_TIMEZONE=Asia/Bangkok
SHOP_OPEN_TIME=09:00
SHOP_CLOSE_TIME=20:00
SERVICE_DURATION_MINUTES=120
SLOT_INTERVAL_MINUTES=60
MAX_ONLINE_SEATS=2
MAX_BOOKINGS_PER_USER=2
MAX_ADVANCE_DAYS=7
ALLOW_SAME_DAY_BOOKING=false
```

รัน D1 local migration และ seed:

```bash
npm run db:migrate:local
npm run db:seed:local
```

เปิด Worker:

```bash
npm run dev:worker
```

ถ้า Worker แจ้งว่า port `8787` ถูกใช้งานอยู่ ให้ปิด terminal ที่รัน Worker เก่า หรือบน Windows ใช้คำสั่งนี้เพื่อดู process:

```powershell
netstat -ano | findstr :8787
```

จากนั้นหยุด process นั้น หรือปิด terminal เดิม แล้วรัน `npm run dev:worker` ใหม่

เปิด Next.js อีก terminal:

```bash
npm run dev
```

เข้าเว็บที่ `http://localhost:3000` แล้วใช้ปุ่ม `ทดลอง` เพื่อทดสอบก่อนตั้งค่า LINE จริง

## Deploy ทีละขั้น

### 1. สร้าง GitHub repository

1. เข้า GitHub แล้วกด New repository
2. ตั้งชื่อ เช่น `kperfect-booking`
3. อัปโหลดโค้ดทั้งโปรเจกต์นี้เข้า repository
4. ตรวจว่าไม่มีไฟล์ `.env.local`, `.dev.vars`, `.env` ถูกอัปโหลด

### 2. สร้าง Cloudflare D1

Login Wrangler:

```bash
npx wrangler login
```

สร้าง database:

```bash
npx wrangler d1 create kperfect-booking-db
```

นำ `database_id` ที่ได้ไปใส่ใน `wrangler.toml` ตรง `database_id`

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

ค่า `LINE_LOGIN_REDIRECT_URI` ต้องเป็น URL จริงของ Worker เช่น:

```txt
https://kperfect-booking-api.your-account.workers.dev/api/auth/line/callback
```

Deploy Worker:

```bash
npm run deploy:worker
```

### 4. Deploy Next.js บน Cloudflare Pages

1. เข้า Cloudflare Dashboard
2. ไปที่ Workers & Pages
3. เลือก Create application
4. เลือก Pages แล้ว Connect to Git
5. เลือก GitHub repository ของโปรเจกต์
6. ตั้งค่า build:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `out`
7. ตั้ง Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://<worker-url>`
   - `NEXT_PUBLIC_SITE_URL=https://<pages-url>`
8. กด Deploy

### 5. ตั้งค่า LINE Login

1. เข้า LINE Developers Console
2. สร้าง Provider และ LINE Login Channel
3. ใน Callback URL ใส่:

```txt
https://<worker-url>/api/auth/line/callback
```

4. คัดลอก Channel ID และ Channel secret ไปใส่ใน Worker secrets
5. ตรวจว่า scope ที่ใช้คือ `profile openid`

### 6. ตั้งค่า LINE Messaging API

1. สร้าง Messaging API Channel ใน LINE Developers
2. เปิด Webhook และตั้ง Webhook URL:

```txt
https://<worker-url>/api/line/webhook
```

3. นำ Channel access token และ Channel secret ไปใส่ Worker secrets
4. เชิญ LINE Official Account เข้ากลุ่มร้าน
5. ส่งข้อความ `groupid` ในกลุ่มหนึ่งครั้ง ระบบจะบันทึก group id ลง D1 อัตโนมัติ

ถ้าต้องการตั้งแบบ manual ให้ใส่ `LINE_GROUP_ID` เป็น secret ได้เลย

## API หลัก

| Method | Path | ใช้ทำอะไร |
| --- | --- | --- |
| GET | `/api/config` | อ่าน config ร้าน |
| GET | `/api/auth/line/url` | สร้าง LINE Login URL |
| GET | `/api/auth/line/callback` | รับ callback จาก LINE |
| POST | `/api/auth/dev-login` | login ทดลองเฉพาะ local |
| GET | `/api/me` | อ่าน user session |
| GET | `/api/slots?date=YYYY-MM-DD` | ดูช่วงเวลาว่าง |
| GET | `/api/bookings` | ดูคิวของลูกค้า |
| POST | `/api/bookings` | สร้าง booking |
| POST | `/api/bookings/:id/cancel` | ลูกค้ายกเลิกคิว |
| GET | `/api/admin/bookings` | admin ดูคิว |
| POST | `/api/admin/bookings/:id/cancel` | admin ยกเลิกคิว |
| POST | `/api/admin/notify-today` | ส่งสรุปคิววันนี้เข้า LINE Group |
| POST | `/api/line/webhook` | รับ webhook จาก LINE |

## ปรับค่าร้าน

ค่าที่แก้บ่อยอยู่ใน `.env.example`, `.dev.vars`, `wrangler.toml` และ Cloudflare Worker variables/secrets:

- `BRANCH_NAME`
- `SHOP_OPEN_TIME`
- `SHOP_CLOSE_TIME`
- `SERVICE_DURATION_MINUTES`
- `SLOT_INTERVAL_MINUTES`
- `MAX_ONLINE_SEATS`
- `MAX_BOOKINGS_PER_USER`
- `MAX_ADVANCE_DAYS`
- `ALLOW_SAME_DAY_BOOKING`

Frontend fallback อยู่ที่ `lib/config.ts` เพื่อให้ UI แสดงข้อมูลตรงกับค่าเริ่มต้น

## ตรวจคุณภาพก่อน deploy

```bash
npm run typecheck
npm run build
```

## เอกสารอ้างอิง

- Cloudflare Pages + Next.js: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Cloudflare D1 + Wrangler: https://developers.cloudflare.com/d1/wrangler-commands/
- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- LINE Login web app: https://developers.line.biz/en/docs/line-login/integrate-line-login/
- LINE Messaging API sending messages: https://developers.line.biz/en/docs/messaging-api/sending-messages/
=======
# kperfect-booking
kperfect-booking
>>>>>>> 9d24ee4f085d6c0d77f5d26c1f6ce35fcf5d3eac
