
import { apiRequest, type ApiResponse } from "@/lib/api/api-client";

export type AdminPlanStatus = "ALL" | "ACTIVE" | "INACTIVE";

export interface AdminPlan {
  plan_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number | null;
  max_products: number;
  max_users: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPlansSummary {
  total_plans: number;
  available_for_purchase: number;
  inactive_plans: number;
}

export interface AdminPlansData {
  summary: AdminPlansSummary;
  filters: {
    search: string | null;
    status: AdminPlanStatus;
  };
  plans: AdminPlan[];
}

export type AdminPlansResponse = ApiResponse<AdminPlansData>;

export type AdminPlanResponse = ApiResponse<{
  plan: AdminPlan;
}>;

export interface AdminPlansQuery {
  search?: string;
  status?: AdminPlanStatus;
}

export interface AdminPlanPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number | null;
  max_products: number;
  max_users: number;
  is_active: boolean;
  sort_order: number;
}

export type UpdateAdminPlanPayload = Partial<AdminPlanPayload>;

function assertSuccess<T extends { success: boolean; message?: string }>(
  response: T,
): T {
  if (!response.success) {
    throw new Error(response.message || "The request could not be completed.");
  }

  return response;
}

/**
 * Fetch all plans, optionally filtered by search text and status.
 */
export async function getAdminPlans(
  query: AdminPlansQuery = {},
): Promise<AdminPlansResponse> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.status && query.status !== "ALL") {
    params.set("status", query.status);
  }

  const queryString = params.toString();
  const endpoint = `/admin/plans${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<AdminPlansResponse>(endpoint, {
    method: "GET",
    portal: "ADMIN",
  });

  return assertSuccess(response);
}

/**
 * Fetch one plan by its numeric ID.
 */
export async function getAdminPlanById(
  planId: string | number,
): Promise<AdminPlanResponse> {
  const response = await apiRequest<AdminPlanResponse>(
    `/admin/plans/${encodeURIComponent(String(planId))}`,
    {
      method: "GET",
      portal: "ADMIN",
    },
  );

  return assertSuccess(response);
}

/**
 * Create a new plan.
 */
export async function createAdminPlan(
  payload: AdminPlanPayload,
): Promise<AdminPlanResponse> {
  const response = await apiRequest<AdminPlanResponse>("/admin/plans", {
    method: "POST",
    portal: "ADMIN",
    body: JSON.stringify(payload),
  });

  return assertSuccess(response);
}

/**
 * Update an existing plan. Partial payloads are supported by the API.
 */
export async function updateAdminPlan(
  planId: string | number,
  payload: UpdateAdminPlanPayload,
): Promise<AdminPlanResponse> {
  const response = await apiRequest<AdminPlanResponse>(
    `/admin/plans/${encodeURIComponent(String(planId))}`,
    {
      method: "PUT",
      portal: "ADMIN",
      body: JSON.stringify(payload),
    },
  );

  return assertSuccess(response);
}
