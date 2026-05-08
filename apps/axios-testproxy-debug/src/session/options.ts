import type { SessionOptions } from "iron-session";

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  expiredAt: string; // ISO string
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? "debug-session-secret-32-chars-min!!",
  cookieName: "debug-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
