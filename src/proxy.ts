import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_PORTAL_HEADER, getPortalCookieNames, getPortalForPath } from "@/lib/auth/auth-portal";
import { frontendCookie } from "@/lib/auth/frontend-cookie";

/*
 * Reads the "name=value" pair from a Set-Cookie header.
 */
function parseSetCookie(setCookie: string) {
  const [pair] = setCookie.split(";");
  const separatorIndex = pair.indexOf("=");

  return {
    name: pair.slice(0, separatorIndex).trim(),
    value: pair.slice(separatorIndex + 1).trim(),
  };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const portal = getPortalForPath(pathname);
  const routes = { loginPath: "/login", homePath: "/", authPages: ["/login"] };

  const isAuthPage = routes.authPages.includes(pathname);
  let setCookieHeaders: string[] = [];

  /*
   * Add backend Set-Cookie headers to the browser response.
   */
  const withRenewedCookies = (response: NextResponse) => {
    for (const setCookie of setCookieHeaders) {
      response.headers.append("Set-Cookie", frontendCookie(setCookie, request.nextUrl.protocol === "https:"));
    }

    return response;
  };

  const redirectTo = (path: string) => {
    return withRenewedCookies(NextResponse.redirect(new URL(path, request.url)));
  };

  /*
   * Continue the request after refreshing cookies.
   */
  const continueRequest = () => {
    if (setCookieHeaders.length === 0) {
      return NextResponse.next();
    }

    /*
     * Update request cookies with newly rotated tokens, so Server
     * Components rendering this request use the fresh access token.
     */
    for (const setCookie of setCookieHeaders) {
      const { name, value } = parseSetCookie(setCookie);

      if (value) {
        request.cookies.set(name, value);
      } else {
        request.cookies.delete(name);
      }
    }

    return withRenewedCookies(
      NextResponse.next({
        request: {
          headers: request.headers,
        },
      }),
    );
  };

  const portalCookies = getPortalCookieNames(portal);

  const hasPortalCookies =
    request.cookies.has(portalCookies.accessToken) || request.cookies.has(portalCookies.refreshToken);

  let isSignedIn = false;

  // No cookies for this portal: signed out, no need to ask the API.
  if (hasPortalCookies) {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: request.headers.get("cookie") ?? "",
          [AUTH_PORTAL_HEADER]: portal,
        },
        cache: "no-store",
      });

      /*
       * When the access cookie expired, /auth/me renews it with the refresh
       * cookie and rotates both. Forward them, or the browser keeps a
       * revoked refresh token and the user gets logged out.
       */
      setCookieHeaders = response.headers.getSetCookie();

      if (response.ok) {
        const result = await response.json();

        const user: { active_portal?: string; roles?: string[] } | null = result.user ?? result.data?.user ?? result.data ?? result;

        isSignedIn = user?.active_portal === portal && Array.isArray(user.roles) && user.roles.includes("ADMIN");
      }
    } catch {
      console.error("Proxy auth check failed");
    }
  }

  if (isAuthPage) {
    return isSignedIn ? redirectTo(routes.homePath) : continueRequest();
  }

  return isSignedIn ? continueRequest() : redirectTo(routes.loginPath);
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next/|images/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
