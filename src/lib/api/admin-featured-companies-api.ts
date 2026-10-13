import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";

export type FeaturedBusinessType =
  | "MANUFACTURER"
  | "SUPPLIER"
  | "EXPORTER"
  | "OEM"
  | "DISTRIBUTOR";

export type FeaturedFilter =
  | "ALL"
  | "FEATURED"
  | "UNFEATURED";

export interface AdminFeaturedCompany {
  company_id: number;
  name: string;
  slug: string;
  company_logo_url: string;
  city: string;
  state: string;
  business_types: string[];
  is_featured: boolean;
  featured_since: string | null;
  featured_priority: number | null;
}

export interface FeaturedCompaniesPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface GetFeaturedCompaniesParams {
  search?: string;
  business_type?: FeaturedBusinessType;
  featured?: FeaturedFilter;
  page?: number;
  limit?: number;
}

export interface FeaturedCompaniesData {
  companies: AdminFeaturedCompany[];
  pagination: FeaturedCompaniesPagination;
}

export type GetFeaturedCompaniesResponse =
  ApiResponse<FeaturedCompaniesData>;

export interface UpdateFeaturedCompanyPayload {
  is_featured: boolean;
  priority?: number;
}

export interface UpdateFeaturedCompanyData {
  company: AdminFeaturedCompany;
}

export type UpdateFeaturedCompanyResponse =
  ApiResponse<UpdateFeaturedCompanyData>;

/* -------------------------------------------------------------------------- */
/* Get Featured Companies                                                     */
/* -------------------------------------------------------------------------- */

export async function getFeaturedCompanies(
  params: GetFeaturedCompaniesParams = {},
): Promise<GetFeaturedCompaniesResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.business_type) {
    searchParams.set(
      "business_type",
      params.business_type,
    );
  }

  if (params.featured) {
    searchParams.set(
      "featured",
      params.featured,
    );
  }

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "limit",
    String(params.limit ?? 10),
  );

  const queryString = searchParams.toString();

  return apiRequest<GetFeaturedCompaniesResponse>(
    `/admin/featured-companies?${queryString}`,
    {
      method: "GET",
      portal: "ADMIN",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Update Featured Company                                                    */
/* -------------------------------------------------------------------------- */

export async function updateFeaturedCompany(
  companyId: number,
  payload: UpdateFeaturedCompanyPayload,
): Promise<UpdateFeaturedCompanyResponse> {
  return apiRequest<UpdateFeaturedCompanyResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/featured`,
    {
      method: "PATCH",
      portal: "ADMIN",
      body: JSON.stringify(payload),
    },
  );
}