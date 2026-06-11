export const ADMIN_SESSION_COOKIE = "admin_session";

export function hasAdminSession(): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`));
}
