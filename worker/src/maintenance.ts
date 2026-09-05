import { getBookingRetentionCutoffDate } from "./config";
import { purgeOldBookingData } from "./db";
import type { Env } from "./env";

export async function purgeExpiredBookingData(env: Env) {
  const cutoffDate = getBookingRetentionCutoffDate(env);
  return purgeOldBookingData(env, cutoffDate);
}
