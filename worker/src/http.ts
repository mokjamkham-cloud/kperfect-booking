import type { Env } from "./env";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "รูปแบบ JSON ไม่ถูกต้อง");
  }
}

export function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = (env.CORS_ORIGIN || env.FRONTEND_URL || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) ? origin : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
    Vary: "Origin",
  };
}

export function jsonResponse(data: unknown, request: Request, env: Env, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");

  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function redirectResponse(url: string, request: Request, env: Env, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Location", url);

  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }

  return new Response(null, {
    ...init,
    status: init.status || 302,
    headers,
  });
}

export function optionsResponse(request: Request, env: Env) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  });
}

export function errorResponse(error: unknown, request: Request, env: Env) {
  if (error instanceof HttpError) {
    return jsonResponse(
      {
        error: error.name,
        message: error.message,
        details: error.details,
      },
      request,
      env,
      { status: error.status },
    );
  }

  console.error(error);
  return jsonResponse(
    {
      error: "InternalServerError",
      message: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
    },
    request,
    env,
    { status: 500 },
  );
}

export function notFound(request: Request, env: Env) {
  return jsonResponse({ error: "NotFound", message: "ไม่พบ API ที่เรียกใช้งาน" }, request, env, { status: 404 });
}
