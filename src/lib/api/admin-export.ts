import { runRefresh } from "@/lib/api/api-client";
import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";

export async function fetchAdminExport(endpoint: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set(AUTH_PORTAL_HEADER, "ADMIN");
  const execute = () => fetch(`/api/admin-backend${endpoint}`, { ...options, headers, credentials: "include" });
  let response = await execute();
  if (response.status === 401 && await runRefresh("ADMIN")) response = await execute();
  return response;
}
