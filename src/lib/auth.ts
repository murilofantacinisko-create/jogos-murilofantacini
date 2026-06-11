import { NextRequest } from "next/server";
import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getSessionToken(): string {
  return crypto
    .createHash("sha256")
    .update(process.env.ADMIN_PASSWORD ?? "")
    .digest("hex");
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return !!token && token === getSessionToken();
}
