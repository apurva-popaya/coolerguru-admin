import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import { cookies } from "next/headers";

import type {
  AdminCompanyDetailResponse,
} from "@/lib/api/admin-companies-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1";

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`,
    )
    .join("; ");
}

export async function getAdminCompanyDetailServer(
  companyId: number | string,
) {
  const cookieHeader =
    await getCookieHeader();

  const response = await fetch(
    `${API_BASE_URL}/admin/companies/${encodeURIComponent(
      String(companyId),
    )}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        [AUTH_PORTAL_HEADER]: "ADMIN",
      },

      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as AdminCompanyDetailResponse;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Unable to fetch company details.",
    );
  }

  return result;
}