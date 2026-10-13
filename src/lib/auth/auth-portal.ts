import type { ActivePortal } from "@/lib/auth/auth-types";

/*
 * The backend keeps separate cookies per portal (buyer_access_token,
 * seller_access_token, admin_access_token, ...) so one browser can be signed
 * in as buyer, seller and admin at the same time. Every authenticated request
 * must say which portal's cookies to use with the X-Auth-Portal header,
 * otherwise the API rejects requests from browsers signed in to several portals.
 */
export const AUTH_PORTAL_HEADER = "X-Auth-Portal";

/* Every route in this standalone application belongs to ADMIN. */
export function getPortalForPath(_pathname: string): ActivePortal {
  return "ADMIN";
}

/* Cookie names used by the backend for a portal. */
export function getPortalCookieNames(portal: ActivePortal) {
  const prefix = portal.toLowerCase();

  return {
    accessToken: `${prefix}_access_token`,
    refreshToken: `${prefix}_refresh_token`,
  };
}
