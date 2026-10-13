import { cookies } from "next/headers";

import { AUTH_PORTAL_HEADER, getPortalCookieNames } from "@/lib/auth/auth-portal";
import type { ActivePortal, AuthUser } from "@/lib/auth/auth-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function getServerAuthUser(_portal: ActivePortal = "ADMIN"): Promise<AuthUser | null> {
  const portal = "ADMIN";
  const cookieStore = await cookies();

  const portalCookies = getPortalCookieNames(portal);

  if (!cookieStore.has(portalCookies.accessToken) && !cookieStore.has(portalCookies.refreshToken)) {
    return null;
  }

  const cookieHeader = cookieStore
    .getAll()
    .filter(({ name }) => name === portalCookies.accessToken || name === portalCookies.refreshToken)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        [AUTH_PORTAL_HEADER]: portal,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    // console.log("✅ [Auth Debug] API Response result:", result);

    // Handle different backend response shapes safely:
    // 1. Direct user object at root: { user: { ... } }
    if (result.user) {
      return result.user;
    }

    // 2. Wrapped in data/success format: { success: true, data: { user: { ... } } }
    if (result.data?.user) {
      return result.data.user;
    }

    if (typeof result.data?.user_id === "number" && result.data.active_portal) {
      return result.data as AuthUser;
    }

    // 3. Fallback flat properties if sent directly
    if (typeof result.user_id === "number" && result.active_portal) {
      return result as AuthUser;
    }

    return null;
  } catch {
    return null;
  }
}
