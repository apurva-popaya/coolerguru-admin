import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import { runRefresh } from "@/lib/api/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminUser {
  user_id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  roles: string[];
  active_portal: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AdminUser;
  };
}

interface AddAdminRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface AddAdminResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function getAuthErrorMessage(status: number, endpoint: string): string {
  const isLogin = endpoint === "/auth/admin/login";

  if (status === 401) {
    return isLogin
      ? "The email or password is incorrect. Please check your details and try again."
      : "Your session has expired. Please log in again to add an administrator.";
  }

  if (status === 403) {
    return isLogin
      ? "You don't have access to the admin portal. Please contact your administrator."
      : "You don't have permission to add administrators. Please contact your administrator.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (!isLogin && status === 409) {
    return "An account with these details already exists. Please use a different email address.";
  }

  if (status === 400 || status === 422) {
    return isLogin
      ? "We couldn't log you in. Please check your email and password and try again."
      : "We couldn't add the administrator. Please check the entered details and try again.";
  }

  return isLogin
    ? "We're unable to log you in right now. Please try again in a few minutes."
    : "We're unable to add the administrator right now. Please try again in a few minutes.";
}

async function postRequest<TResponse>(endpoint: string, body: unknown): Promise<TResponse> {
  const baseUrl = typeof window !== "undefined" ? "/api/admin-backend" : API_BASE_URL;
  const execute = () => fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Use the admin cookies even if a buyer or seller is signed in too.
      [AUTH_PORTAL_HEADER]: "ADMIN",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  let response = await execute();
  if (response.status === 401 && endpoint !== "/auth/admin/login" && await runRefresh("ADMIN")) {
    response = await execute();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    // Only show controlled messages; backend details may contain technical or sensitive information.
    throw new AdminAuthError(getAuthErrorMessage(response.status, endpoint));
  }

  return data as TResponse;
}

export async function loginAdmin(email: string, password: string) {
  const payload: AdminLoginRequest = {
    email: email.trim(),
    password,
  };

  return postRequest<AdminLoginResponse>("/auth/admin/login", payload);
}

export async function addAdmin(name: string, email: string, password: string, confirmPassword: string) {
  const payload: AddAdminRequest = {
    name,
    email: email.trim(),
    password,
    confirm_password: confirmPassword,
  };

  return postRequest<AddAdminResponse>("/admin/accounts", payload);
}
