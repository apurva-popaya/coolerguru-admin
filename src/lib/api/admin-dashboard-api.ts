import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";

export interface AdminDashboardSummary {
  total_companies: number;
  pending_company_approvals: number;
  total_products: number;
  pending_product_approvals: number;
  total_users: number;
  total_inquiries: number;
}

export interface AdminDashboardUserDistribution {
  buyers: number;
  sellers: number;
  admins: number;
}

export interface AdminDashboardCompany {
  company_id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  verification_status: string;
  created_at: string;
}

export interface AdminDashboardProduct {
  product_id: number;
  name: string;
  slug: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  company: {
    company_id: number;
    name: string;
    slug: string;
  };
}

export interface AdminDashboardInquiry {
  inquiry_id: number;
  inquiry_number: string;
  buyer_name: string;
  status: string;
  created_at: string;
  company: {
    company_id: number;
    name: string;
    slug: string;
  };
}

export interface PlatformGrowthPoint {
  date: string;
  companies: number;
  products: number;
  users: number;
  inquiries: number;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  user_distribution: AdminDashboardUserDistribution;
  recent_companies: AdminDashboardCompany[];
  recent_products: AdminDashboardProduct[];
  recent_inquiries: AdminDashboardInquiry[];
  platform_growth?: PlatformGrowthPoint[];
}

export type AdminDashboardResponse = ApiResponse<AdminDashboardData>;

export interface GetAdminDashboardParams {
  date_from: string;
  date_to: string;
  granularity?: "day" | "week" | "month";
}

/* -------------------------------------------------------------------------- */
/* Admin Dashboard                                                            */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboard({
  date_from,
  date_to,
  granularity = "day",
}: GetAdminDashboardParams): Promise<AdminDashboardResponse> {
  const searchParams = new URLSearchParams({
    date_from,
    date_to,
    granularity,
  });

  return apiRequest<AdminDashboardResponse>(
    `/admin/dashboard?${searchParams.toString()}`,
    {
      method: "GET",
      portal: "ADMIN",
      cache: "no-store",
    },
  );
}