import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";

export type AnalyticsGranularity =
  | "day"
  | "week"
  | "month";

export interface GetAdminAnalyticsParams {
  date_from: string;
  date_to: string;
  granularity: AnalyticsGranularity;
}

export interface AnalyticsFilters {
  date_from: string;
  date_to: string;
  granularity: AnalyticsGranularity;
}

export interface AnalyticsSummary {
  total_users: number;
  total_buyers: number;
  total_suppliers: number;
  total_companies: number;
  total_products: number;
  total_inquiries: number;
  new_users: number;
  new_companies: number;
  new_products: number;
}

export interface AnalyticsComparisonMetric {
  current_period: number;
  previous_period: number;
  change_percentage: number;
}

export interface AnalyticsComparison {
  date_from: string;
  date_to: string;
  metrics: {
    total_users: AnalyticsComparisonMetric;
    total_buyers: AnalyticsComparisonMetric;
    total_suppliers: AnalyticsComparisonMetric;
    total_companies: AnalyticsComparisonMetric;
    total_products: AnalyticsComparisonMetric;
    total_inquiries: AnalyticsComparisonMetric;
    new_users: AnalyticsComparisonMetric;
    new_companies: AnalyticsComparisonMetric;
    new_products: AnalyticsComparisonMetric;
  };
}

export interface InquiryVolumePoint {
  period_start: string;
  period_end: string;
  label: string;
  count: number;
}

export interface UserGrowthPoint {
  period_start: string;
  period_end: string;
  label: string;
  buyers: number;
  suppliers: number;
  new_buyers: number;
  new_suppliers: number;
}

export interface TopCategory {
  category_id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface MostSavedProduct {
  product_id: number;
  name: string;
  slug: string;
  saved_count: number;
}

export interface MostSavedCompany {
  company_id: number;
  name: string;
  slug: string;
  saved_count: number;
}

export interface AdminAnalyticsData {
  filters: AnalyticsFilters;

  summary: AnalyticsSummary;

  comparison: AnalyticsComparison;

  inquiry_volume: InquiryVolumePoint[];

  user_growth: UserGrowthPoint[];

  top_categories: TopCategory[];

  most_saved_products: MostSavedProduct[];

  most_saved_companies: MostSavedCompany[];
}

export type AdminAnalyticsResponse =
  ApiResponse<AdminAnalyticsData>;

export async function getAdminAnalytics(
  params: GetAdminAnalyticsParams,
): Promise<AdminAnalyticsResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "date_from",
    params.date_from,
  );

  searchParams.set(
    "date_to",
    params.date_to,
  );

  searchParams.set(
    "granularity",
    params.granularity,
  );

  return apiRequest<AdminAnalyticsResponse>(
    `/admin/analytics?${searchParams.toString()}`,
    {
      method: "GET",
      portal: "ADMIN",
      cache: "no-store",
    },
  );
}