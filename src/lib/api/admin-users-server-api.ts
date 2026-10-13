import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import {
  cookies,
} from "next/headers";

import type {
  AdminUserActivityResponse,
  AdminUserDetailResponse,
} from "@/lib/api/admin-users-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1";

async function getCookieHeader() {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`,
    )
    .join("; ");
}

async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const data =
    await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message ===
      "string"
        ? data.message
        : "Request failed.";

    throw new Error(
      message,
    );
  }

  return data as T;
}

export async function getAdminUserDetailServer(
  userId: number | string,
) {
  const cookieHeader =
    await getCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/admin/users/${encodeURIComponent(String(userId))}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          Cookie:
            cookieHeader,

          [AUTH_PORTAL_HEADER]: "ADMIN",
        },

        cache:
          "no-store",
      },
    );

  return readJsonResponse<AdminUserDetailResponse>(
    response,
  );
}

export async function getAdminUserActivityServer(
  userId: number | string,
) {
  const cookieHeader =
    await getCookieHeader();

  const response =
    await fetch(
      `${API_BASE_URL}/admin/users/${encodeURIComponent(String(userId))}/activity`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          Cookie:
            cookieHeader,

          [AUTH_PORTAL_HEADER]: "ADMIN",
        },

        cache:
          "no-store",
      },
    );

  return readJsonResponse<AdminUserActivityResponse>(
    response,
  );
}