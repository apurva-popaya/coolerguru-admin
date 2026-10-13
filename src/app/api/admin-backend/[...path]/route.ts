import type { NextRequest } from "next/server";

import { AUTH_PORTAL_HEADER, getPortalCookieNames } from "@/lib/auth/auth-portal";
import { frontendCookie } from "@/lib/auth/frontend-cookie";

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  const cookieNames = getPortalCookieNames("ADMIN");
  const headers = new Headers({ Accept: "application/json", [AUTH_PORTAL_HEADER]: "ADMIN" });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set("Cookie", request.cookies.getAll()
    .filter(({ name }) => name === cookieNames.accessToken || name === cookieNames.refreshToken)
    .map(({ name, value }) => `${name}=${value}`).join("; "));

  try {
    const upstream = await fetch(`${base.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
    const response = new Response(upstream.body, { status: upstream.status });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) response.headers.set("Content-Disposition", disposition);
    for (const cookie of upstream.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", frontendCookie(cookie, request.nextUrl.protocol === "https:"));
    }
    return response;
  } catch {
    return Response.json({ message: "Unable to connect to the admin API. Please try again." }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
