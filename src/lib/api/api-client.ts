import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import type { ActivePortal } from "@/lib/auth/auth-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface ApiRequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
  // Retained for API compatibility; this application always uses ADMIN.
  portal?: ActivePortal;
}

function resolvePortal(_portal?: ActivePortal): ActivePortal {
  return "ADMIN";
}

const refreshPromises = new Map<ActivePortal | undefined, Promise<boolean>>();

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (
      data as {
        message?: unknown;
      }
    ).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

async function refreshAccessToken(portal?: ActivePortal): Promise<boolean> {
  try {
    const headers = new Headers({ Accept: "application/json" });

    if (portal) {
      headers.set(AUTH_PORTAL_HEADER, portal);
    }

    const baseUrl = typeof window !== "undefined" && portal === "ADMIN" ? "/api/admin-backend" : API_BASE_URL;
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",

      credentials: "include",

      headers,
    });

    return response.ok;
  } catch {
    return false;
  }
}

/* One refresh at a time per portal. */
export async function runRefresh(portal?: ActivePortal): Promise<boolean> {
  portal = "ADMIN";
  let refreshPromise = refreshPromises.get(portal);

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(portal).finally(() => {
      refreshPromises.delete(portal);
    });

    refreshPromises.set(portal, refreshPromise);
  }

  return refreshPromise;
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuthRefresh = false, portal: portalOption, ...requestOptions } = options;

  const portal = resolvePortal(portalOption);

  const headers = new Headers(requestOptions.headers);

  if (portal) {
    headers.set(AUTH_PORTAL_HEADER, portal);
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const baseUrl = typeof window !== "undefined" && portal === "ADMIN" ? "/api/admin-backend" : API_BASE_URL;
  const executeRequest = () =>
    fetch(`${baseUrl}${endpoint}`, {
      ...requestOptions,

      headers,

      credentials: "include",
    });

  let response = await executeRequest();

  /*
   * If the access cookie expired,
   * attempt refresh once.
   *
   * We skip this behavior for auth
   * endpoints themselves to avoid loops.
   */
  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await runRefresh(portal);

    if (refreshed) {
      response = await executeRequest();
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data as T;
}
