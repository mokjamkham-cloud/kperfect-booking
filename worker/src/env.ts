export interface Env {
  DB: D1Database;
  APP_ENV?: string;
  FRONTEND_URL: string;
  CORS_ORIGIN?: string;
  ADMIN_API_KEY: string;
  SESSION_SECRET: string;
  ENABLE_DEV_AUTH?: string;

  LINE_LOGIN_CHANNEL_ID?: string;
  LINE_LOGIN_CHANNEL_SECRET?: string;
  LINE_LOGIN_REDIRECT_URI?: string;
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN?: string;
  LINE_MESSAGING_CHANNEL_SECRET?: string;
  LINE_GROUP_ID?: string;

  BRANCH_NAME?: string;
  SHOP_TIMEZONE?: string;
  SHOP_OPEN_TIME?: string;
  SHOP_CLOSE_TIME?: string;
  SERVICE_DURATION_MINUTES?: string;
  SLOT_INTERVAL_MINUTES?: string;
  MAX_ONLINE_SEATS?: string;
  MAX_BOOKINGS_PER_USER?: string;
  MAX_ADVANCE_DAYS?: string;
  ALLOW_SAME_DAY_BOOKING?: string;
}
