import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";

export type AdminUserRole =
  | "BUYER"
  | "SELLER"
  | "ADMIN";

export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE";

export type AdminUserAccountType =
  | "INDIVIDUAL"
  | "COMPANY";

export type CreateAdminUserType =
  | "BUYER"
  | "SELLER";

export interface AdminUsersQuery {
  search?: string;

  // Omit to list all roles, including admins; ADMIN filters administrators only.
  role?: AdminUserRole;

  account_type?: AdminUserAccountType;

  status?: AdminUserStatus;

  page?: number;

  limit?: number;
}

export interface AdminUserCompany {
  company_id: number;

  name: string;

  slug: string;

  verification_status: string;
}

export interface AdminUserListItem {
  user_id: number;

  name: string | null;

  email: string | null;

  phone_number: string;

  roles: AdminUserRole[];

  account_type: AdminUserAccountType;

  status: AdminUserStatus;

  company: AdminUserCompany | null;

  joined_at: string;

  last_activity_at: string;
}

export interface AdminUsersPagination {
  page: number;

  limit: number;

  totalItems: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

export interface AdminUsersListData {
  users: AdminUserListItem[];

  pagination: AdminUsersPagination;
}

export interface AdminUsersSummary {
  total: number;

  buyers: number;

  suppliers: number;

  active: number;

  inactive: number;
}

export interface AdminUsersSummaryData {
  summary: AdminUsersSummary;
}

export interface CreateAdminUserPayload {
  user_type: CreateAdminUserType;

  name: string;

  phone_number: string;
}

export interface CreatedAdminUser {
  user_id: number;

  name: string | null;

  first_name: string | null;

  last_name: string | null;

  email: string | null;

  phone_number: string;

  roles: AdminUserRole[];
}

export interface CreateAdminUserData {
  user: CreatedAdminUser;
}

export interface UpdateAdminUserPayload {
  name: string;

  phone_number: string;

  roles: (
    | "BUYER"
    | "SELLER"
  )[];
}

export interface ChangeAdminUserStatusData {
  user: {
    user_id: number;

    status: AdminUserStatus;
  };
}

export type AdminUsersResponse =
  ApiResponse<AdminUsersListData>;

export type AdminUsersSummaryResponse =
  ApiResponse<AdminUsersSummaryData>;

export type CreateAdminUserResponse =
  ApiResponse<CreateAdminUserData>;

export type UpdateAdminUserResponse =
  ApiResponse<Record<string, unknown>>;

export type DeleteAdminUserResponse =
  ApiResponse<Record<string, unknown>>;

export type ChangeAdminUserStatusResponse =
  ApiResponse<ChangeAdminUserStatusData>;

export async function getAdminUsers(
  query: AdminUsersQuery = {},
) {
  const params =
    new URLSearchParams();

  if (query.search?.trim()) {
    params.set(
      "search",
      query.search.trim(),
    );
  }

  if (query.role) {
    params.set(
      "role",
      query.role,
    );
  }

  if (query.account_type) {
    params.set(
      "account_type",
      query.account_type,
    );
  }

  if (query.status) {
    params.set(
      "status",
      query.status,
    );
  }

  params.set(
    "page",
    String(
      query.page ?? 1,
    ),
  );

  params.set(
    "limit",
    String(
      query.limit ?? 10,
    ),
  );

  return apiRequest<AdminUsersResponse>(
    `/admin/users?${params.toString()}`,
    {
      method: "GET",
      portal: "ADMIN",
    },
  );
}

export async function getAdminUsersSummary() {
  return apiRequest<AdminUsersSummaryResponse>(
    "/admin/users/summary",
    {
      method: "GET",
    },
  );
}

export async function createAdminUser(
  payload: CreateAdminUserPayload,
) {
  return apiRequest<CreateAdminUserResponse>(
    "/admin/users",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function updateAdminUser(
  userId: number | string,
  payload: UpdateAdminUserPayload,
) {
  return apiRequest<UpdateAdminUserResponse>(
    `/admin/users/${encodeURIComponent(String(userId))}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function deleteAdminUser(
  userId: number | string,
) {
  return apiRequest<DeleteAdminUserResponse>(
    `/admin/users/${encodeURIComponent(String(userId))}`,
    {
      method: "DELETE",
    },
  );
}

export async function changeAdminUserStatus(
  userId: number | string,
  isActive: boolean,
) {
  return apiRequest<ChangeAdminUserStatusResponse>(
    `/admin/users/${encodeURIComponent(String(userId))}/status`,
    {
      method: "PATCH",
      // The same endpoint manages buyer, seller, and admin account status.
      portal: "ADMIN",

      body:
        JSON.stringify({
          is_active:
            isActive,
        }),
    },
  );
}

export interface AdminUserRoleAssignment {
  status: string;

  assigned_at: string;

  role: {
    name: AdminUserRole;
  };
}

export interface AdminUserDetailCompany {
  company_id: number;

  name: string;

  slug: string;

  verification_status: string;
}

export interface AdminUserTrackingAvailability {
  product_views: boolean;

  company_views: boolean;
}

export interface AdminUserDetail {
  user_id: number;

  name: string | null;

  first_name: string | null;

  last_name: string | null;

  email: string | null;

  phone_number: string;

  phone_verified_at: string | null;

  email_verified_at: string | null;

  roles: AdminUserRole[];

  role_assignments: AdminUserRoleAssignment[];

  account_type: AdminUserAccountType;

  status: AdminUserStatus;

  joined_at: string;

  updated_at: string;

  last_activity_at: string;

  company:
    AdminUserDetailCompany | null;

  buyer_metrics:
    Record<string, unknown> | null;

  supplier_metrics:
    Record<string, unknown> | null;

  tracking_available:
    AdminUserTrackingAvailability;
}

export interface AdminUserDetailData {
  user: AdminUserDetail;
}

export interface AdminUserActivityItem {
  [key: string]:
    unknown;
}

export interface AdminUserActivityMeta {
  limit: number;

  view_tracking_available:
    boolean;
}

export interface AdminUserActivityData {
  activities:
    AdminUserActivityItem[];

  meta:
    AdminUserActivityMeta;
}

export type AdminUserDetailResponse =
  ApiResponse<AdminUserDetailData>;

export type AdminUserActivityResponse =
  ApiResponse<AdminUserActivityData>;

export async function getAdminUserDetail(
  userId: number | string,
) {
  return apiRequest<AdminUserDetailResponse>(
    `/admin/users/${encodeURIComponent(String(userId))}`,
    {
      method: "GET",
    },
  );
}

export async function getAdminUserActivity(
  userId: number | string,
) {
  return apiRequest<AdminUserActivityResponse>(
    `/admin/users/${encodeURIComponent(String(userId))}/activity`,
    {
      method: "GET",
    },
  );
}
