import { getUserById, upsertLineUser } from "./db";
import type { Env } from "./env";
import { HttpError, jsonResponse, redirectResponse } from "./http";
import { timingSafeEqual } from "./security";
import type { LineProfile, UserProfile } from "./types";

type SessionPayload = {
  userId: string;
  exp: number;
};

type LineTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

const SESSION_COOKIE = "kp_session";
const LINE_STATE_COOKIE = "kp_line_state";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeJson(data: unknown) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function parseCookies(request: Request) {
  const header = request.headers.get("Cookie") || "";
  const cookies = new Map<string, string>();

  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name) continue;
    cookies.set(name, rest.join("="));
  }

  return cookies;
}

function cookieOptions(env: Env, maxAge: number) {
  const secure = env.APP_ENV === "production";
  const sameSite = secure ? "None" : "Lax";
  return `Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

function setCookie(headers: Headers, env: Env, name: string, value: string, maxAge: number) {
  headers.append("Set-Cookie", `${name}=${value}; ${cookieOptions(env, maxAge)}`);
}

function clearCookie(headers: Headers, env: Env, name: string) {
  setCookie(headers, env, name, "", 0);
}

async function signSession(user: UserProfile, env: Env) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 16) {
    throw new HttpError(500, "SESSION_SECRET ยังไม่พร้อมใช้งาน");
  }

  const payload = encodeJson({
    userId: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  } satisfies SessionPayload);
  const signature = await hmac(payload, env.SESSION_SECRET);
  return `${payload}.${signature}`;
}

async function verifySession(token: string | undefined, env: Env) {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await hmac(payload, env.SESSION_SECRET);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  const session = decodeJson<SessionPayload>(payload);
  if (session.exp < Math.floor(Date.now() / 1000)) return null;

  return session;
}

export async function getCurrentUser(request: Request, env: Env) {
  const cookies = parseCookies(request);
  const session = await verifySession(cookies.get(SESSION_COOKIE), env);
  if (!session) return null;
  return getUserById(env, session.userId);
}

export async function requireUser(request: Request, env: Env) {
  const user = await getCurrentUser(request, env);
  if (!user) throw new HttpError(401, "กรุณาเข้าสู่ระบบก่อนใช้งาน");
  return user;
}

export async function handleMe(request: Request, env: Env) {
  const user = await getCurrentUser(request, env);
  return jsonResponse({ user }, request, env);
}

export async function handleLineLoginUrl(request: Request, env: Env) {
  if (!env.LINE_LOGIN_CHANNEL_ID || !env.LINE_LOGIN_CHANNEL_SECRET || !env.LINE_LOGIN_REDIRECT_URI) {
    throw new HttpError(500, "ยังไม่ได้ตั้งค่า LINE Login");
  }

  const state = crypto.randomUUID();
  const url = buildLineLoginUrl(env, state);

  const response = jsonResponse({ url: url.toString() }, request, env);
  setCookie(response.headers, env, LINE_STATE_COOKIE, state, 600);
  return response;
}

export async function handleLineLoginStart(request: Request, env: Env) {
  if (!env.LINE_LOGIN_CHANNEL_ID || !env.LINE_LOGIN_CHANNEL_SECRET || !env.LINE_LOGIN_REDIRECT_URI) {
    throw new HttpError(500, "ยังไม่ได้ตั้งค่า LINE Login");
  }

  const state = crypto.randomUUID();
  const response = redirectResponse(buildLineLoginUrl(env, state).toString(), request, env);
  setCookie(response.headers, env, LINE_STATE_COOKIE, state, 600);
  return response;
}

function buildLineLoginUrl(env: Env, state: string) {
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.LINE_LOGIN_CHANNEL_ID || "");
  url.searchParams.set("redirect_uri", env.LINE_LOGIN_REDIRECT_URI || "");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile openid");
  return url;
}

async function exchangeLineCode(code: string, env: Env) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.LINE_LOGIN_REDIRECT_URI || "",
    client_id: env.LINE_LOGIN_CHANNEL_ID || "",
    client_secret: env.LINE_LOGIN_CHANNEL_SECRET || "",
  });

  const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new HttpError(401, "LINE Login ไม่สำเร็จ");
  }

  return response.json<LineTokenResponse>();
}

async function fetchLineProfile(accessToken: string) {
  const response = await fetch("https://api.line.me/v2/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new HttpError(401, "อ่านข้อมูล LINE Profile ไม่สำเร็จ");
  }

  return response.json<LineProfile>();
}

export async function handleLineCallback(request: Request, env: Env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const redirectUrl = new URL("/login/callback", env.FRONTEND_URL);

  if (error) {
    redirectUrl.searchParams.set("status", "error");
    redirectUrl.searchParams.set("message", error);
    return redirectResponse(redirectUrl.toString(), request, env);
  }

  const cookies = parseCookies(request);
  if (!code || !state || cookies.get(LINE_STATE_COOKIE) !== state) {
    throw new HttpError(401, "LINE Login state ไม่ถูกต้อง");
  }

  const token = await exchangeLineCode(code, env);
  const profile = await fetchLineProfile(token.access_token);
  const user = await upsertLineUser(env, profile);
  if (!user) throw new HttpError(500, "สร้างผู้ใช้ไม่สำเร็จ");

  const session = await signSession(user, env);
  redirectUrl.searchParams.set("status", "ok");
  const response = redirectResponse(redirectUrl.toString(), request, env);
  setCookie(response.headers, env, SESSION_COOKIE, session, 60 * 60 * 24 * 7);
  clearCookie(response.headers, env, LINE_STATE_COOKIE);
  return response;
}

export async function handleDevLogin(request: Request, env: Env) {
  if (env.APP_ENV === "production" || env.ENABLE_DEV_AUTH !== "true") {
    throw new HttpError(404, "ไม่เปิดใช้ dev login");
  }

  const user = await upsertLineUser(env, {
    userId: "demo-line-user",
    displayName: "ลูกค้าทดลอง",
  });
  if (!user) throw new HttpError(500, "สร้างผู้ใช้ทดลองไม่สำเร็จ");

  const session = await signSession(user, env);
  const response = jsonResponse({ user }, request, env);
  setCookie(response.headers, env, SESSION_COOKIE, session, 60 * 60 * 24 * 7);
  return response;
}

export async function handleLogout(request: Request, env: Env) {
  const response = jsonResponse({ ok: true }, request, env);
  clearCookie(response.headers, env, SESSION_COOKIE);
  return response;
}
