import { dateStringInTimezone } from "./config";
import { getSetting, listAdminBookings, setSetting } from "./db";
import type { Env } from "./env";
import { HttpError, jsonResponse } from "./http";
import { timingSafeEqual } from "./security";
import type { Booking, BookingWithUser, UserProfile } from "./types";

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: {
    type: "user" | "group" | "room";
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
};

type LineWebhookBody = {
  events?: LineEvent[];
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function verifyLineSignature(rawBody: string, signature: string | null, channelSecret: string | undefined) {
  if (!channelSecret) return true;
  if (!signature) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(channelSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return timingSafeEqual(bytesToBase64(new Uint8Array(signed)), signature);
}

async function pushLineMessage(env: Env, to: string | undefined | null, text: string) {
  if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || !to) return false;

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text }],
    }),
  });

  return response.ok;
}

async function replyLineMessage(env: Env, replyToken: string | undefined, text: string) {
  if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || !replyToken) return false;

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });

  return response.ok;
}

async function getLineGroupId(env: Env) {
  return env.LINE_GROUP_ID || (await getSetting(env, "line_group_id"));
}

export async function sendBookingConfirmation(env: Env, user: UserProfile, booking: Booking) {
  const text = [
    "ยืนยันการจอง K Perfect Nails สาขานิมมาน",
    `วันที่: ${booking.bookingDate}`,
    `เวลา: ${booking.startTime} - ${booking.endTime} น.`,
    `ชื่อ: ${booking.customerName}`,
    `จำนวน: ${booking.seats} ที่`,
  ].join("\n");

  await pushLineMessage(env, user.lineUserId, text);
}

export async function sendBookingNoticeToGroup(env: Env, booking: Booking) {
  const groupId = await getLineGroupId(env);
  if (!groupId) return false;

  const text = [
    "มีคิวจองออนไลน์ใหม่",
    `วันที่: ${booking.bookingDate}`,
    `เวลา: ${booking.startTime} - ${booking.endTime} น.`,
    `ลูกค้า: ${booking.customerName}`,
    `โทร: ${booking.phone}`,
    `จำนวน: ${booking.seats} ที่`,
  ].join("\n");

  return pushLineMessage(env, groupId, text);
}

function formatDailySummary(bookings: BookingWithUser[], date: string) {
  if (bookings.length === 0) {
    return [`สรุปคิว K Perfect Nimman`, `วันที่ ${date}`, "วันนี้ยังไม่มีคิวออนไลน์"].join("\n");
  }

  const lines = bookings.map((booking, index) => {
    return `${index + 1}. ${booking.startTime}-${booking.endTime} ${booking.customerName} (${booking.seats} ที่) โทร ${booking.phone}`;
  });

  return [`สรุปคิว K Perfect Nimman`, `วันที่ ${date}`, ...lines].join("\n");
}

export async function sendDailySummary(env: Env, date?: string) {
  const targetDate = date || dateStringInTimezone(new Date(), env.SHOP_TIMEZONE || "Asia/Bangkok");
  const groupId = await getLineGroupId(env);
  if (!groupId) return false;

  const bookings = await listAdminBookings(env, { date: targetDate, status: "confirmed" });
  return pushLineMessage(env, groupId, formatDailySummary(bookings, targetDate));
}

export async function handleLineWebhook(request: Request, env: Env) {
  const rawBody = await request.text();
  const isValid = await verifyLineSignature(rawBody, request.headers.get("x-line-signature"), env.LINE_MESSAGING_CHANNEL_SECRET);

  if (!isValid) {
    throw new HttpError(401, "LINE signature ไม่ถูกต้อง");
  }

  const body = JSON.parse(rawBody) as LineWebhookBody;
  const events = body.events || [];

  for (const event of events) {
    const groupId = event.source?.groupId;

    if (groupId) {
      await setSetting(env, "line_group_id", groupId);
    }

    const text = event.message?.text?.trim().toLowerCase();
    if (groupId && event.replyToken && text && ["groupid", "group id", "id"].includes(text)) {
      await replyLineMessage(env, event.replyToken, `LINE Group ID: ${groupId}`);
    }
  }

  return jsonResponse({ ok: true }, request, env);
}
