import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";
import { csvToExcelBlob } from "@/lib/csv-to-excel";

export type AdminCompanyVerificationStatus =
  | "DRAFT"
  | "PENDING"
  | "UNDER_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

export interface AdminCompanyOwner {
  user_id: number;
  name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string | null;
  phone_number: string;
  phone_verified_at?: string | null;
  email_verified_at?: string | null;
}

export interface AdminCompanyBusinessHoursItem {
  open: string | null;
  close: string | null;
  is_closed: boolean;
}

export interface AdminCompanyBusinessHours {
  sunday?: AdminCompanyBusinessHoursItem;
  saturday?: AdminCompanyBusinessHoursItem;
  monday_to_friday?: AdminCompanyBusinessHoursItem;
  [key: string]: AdminCompanyBusinessHoursItem | undefined;
}

export interface AdminCompanyDetailCategory {
  category_id: number;
  name: string;
  slug: string;
}

export interface AdminCompanyDetailRecentProduct {
  product_id: number;
  name: string;
  slug: string;
  price: string | null;
  min_price: string | null;
  max_price: string | null;
  currency: string;
  price_unit: string | null;
  is_active: boolean;
  created_at: string;

  category: {
    category_id: number;
    name: string;
    slug: string;
  };
}

export interface AdminCompanyDetailRecentInquiry {
  inquiry_id: number;
  inquiry_number: string;
  inquiry_type: string;
  status: string;
  buyer_name: string;
  product_requirement: string;
  quantity: number | null;
  quantity_unit: string | null;
  created_at: string;
  last_activity_at: string;

  product: {
    product_id: number;
    name: string;
    slug: string;
  } | null;

  latest_response: {
    message: string;
    created_at: string;
  } | null;
}

export interface AdminCompanyDetail {
  company_id: number;
  owner_user_id: number;

  name: string;
  slug: string;

  description: string | null;

  company_logo_url: string | null;
  cover_image_url: string | null;

  company_type: string | null;

  business_types: string[];

  pan_number: string | null;
  pan_document_url: string | null;

  has_gst: boolean;

  gst_number: string | null;
  gst_certificate_url: string | null;

  registration_number: string | null;
  incorporation_certificate_url: string | null;

  shop_establishment_number: string | null;
  shop_establishment_document_url: string | null;

  phone_number: string | null;
  email: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;

  website_url: string | null;

  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;

  business_hours: AdminCompanyBusinessHours | null;

  map_address: string | null;

  latitude: string | null;
  longitude: string | null;

  established_year: number | null;
  years_in_business: string | null;
  employee_size: string | null;

  certifications: string[];

  brochure_url: string | null;

  verification_status: AdminCompanyVerificationStatus;
  verification_note: string | null;

  is_featured: boolean;
  featured_since: string | null;
  featured_priority: number | null;

  is_active: boolean;

  deleted_at: string | null;

  created_at: string;
  updated_at: string;

  owner: AdminCompanyOwner;

 _count: {
  products: number;
  inquiries: number;
  saved_by: number;
};

admin_notes: Array<{
  company_admin_note_id: number;
  company_id: number;
  admin_user_id: number;
  note: string;
  created_at: string;
  admin: {
    user_id: number;
    name: string;
    phone_number: string;
  };
}>;

categories: AdminCompanyDetailCategory[];

recent_products: AdminCompanyDetailRecentProduct[];

recent_inquiries: AdminCompanyDetailRecentInquiry[];
}

export interface AdminCompanyDetailData {
  company: AdminCompanyDetail;
}

export type AdminCompanyDetailResponse =
  ApiResponse<AdminCompanyDetailData>;

/* -------------------------------------------------------------------------- */
/* Verification                                                               */
/* -------------------------------------------------------------------------- */

export interface ReviewCompanyVerificationPayload {
  status: "VERIFIED" | "REJECTED";
  note: string;
}

export type ReviewCompanyVerificationResponse =
  ApiResponse<Record<string, unknown>>;

export async function reviewAdminCompanyVerification(
  companyId: number | string,
  payload: ReviewCompanyVerificationPayload,
) {
  return apiRequest<ReviewCompanyVerificationResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/verification`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Featured                                                                   */
/* -------------------------------------------------------------------------- */

export interface UpdateFeaturedCompanyPayload {
  is_featured: boolean;
  priority: number;
}

export interface UpdateFeaturedCompanyData {
  company: {
    company_id: number;
    name: string;
    slug: string;
    is_featured: boolean;
    featured_since: string | null;
    featured_priority: number | null;
  };
}

export type UpdateFeaturedCompanyResponse =
  ApiResponse<UpdateFeaturedCompanyData>;

export async function updateAdminCompanyFeatured(
  companyId: number | string,
  payload: UpdateFeaturedCompanyPayload,
) {
  return apiRequest<UpdateFeaturedCompanyResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/featured`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Active / Suspended status                                                  */
/* -------------------------------------------------------------------------- */

export interface UpdateAdminCompanyStatusPayload {
  is_active: boolean;
  note: string;
}

export interface UpdateAdminCompanyStatusData {
  company?: {
    company_id?: number;
    name?: string;
    is_active?: boolean;
  };
  [key: string]: unknown;
}

export type UpdateAdminCompanyStatusResponse =
  ApiResponse<UpdateAdminCompanyStatusData>;

export async function updateAdminCompanyStatus(
  companyId: number | string,
  payload: UpdateAdminCompanyStatusPayload,
) {
  return apiRequest<UpdateAdminCompanyStatusResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Moderation notes                                                           */
/* -------------------------------------------------------------------------- */

export interface AdminCompanyModerationNote {
  id: number | string;
  note: string;
  created_at: string;

  created_by?: {
    user_id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminCompanyNotesPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminCompanyNotesData {
  notes: AdminCompanyModerationNote[];
  pagination: AdminCompanyNotesPagination;
}

export type AdminCompanyNotesResponse =
  ApiResponse<AdminCompanyNotesData>;

export interface GetAdminCompanyNotesParams {
  page?: number;
  limit?: number;
}

export async function getAdminCompanyNotes(
  companyId: number | string,
  params: GetAdminCompanyNotesParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();

  return apiRequest<AdminCompanyNotesResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/notes${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
    },
  );
}

export interface CreateAdminCompanyNotePayload {
  note: string;
}

export type CreateAdminCompanyNoteResponse =
  ApiResponse<Record<string, unknown>>;

export async function createAdminCompanyNote(
  companyId: number | string,
  payload: CreateAdminCompanyNotePayload,
) {
  return apiRequest<CreateAdminCompanyNoteResponse>(
    `/admin/companies/${encodeURIComponent(String(companyId))}/notes`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* All companies                                                              */
/* -------------------------------------------------------------------------- */

export interface AdminCompaniesPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminCompaniesData {
  companies: AdminCompanyDetail[];
  pagination: AdminCompaniesPagination;
}

export type AdminCompaniesResponse =
  ApiResponse<AdminCompaniesData>;

export interface GetAdminCompaniesParams {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  featured?: "FEATURED" | "UNFEATURED";
  verification_status?:
    | "DRAFT"
    | "PENDING"
    | "UNDER_VERIFICATION"
    | "VERIFIED"
    | "REJECTED";

  page?: number;
  limit?: number;
}

export async function getAdminCompanies(
  params: GetAdminCompaniesParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.featured) searchParams.set("featured", params.featured);

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.verification_status) {
    searchParams.set(
      "verification_status",
      params.verification_status,
    );
  }

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  const queryString =
    searchParams.toString();

  return apiRequest<AdminCompaniesResponse>(
    `/admin/companies${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
    },
  );
}


export interface UpdateAdminCompanyStatusPayload {
  is_active: boolean;
  note: string;
}



/* -------------------------------------------------------------------------- */
/* Export Companies                                                           */
/* -------------------------------------------------------------------------- */

export type AdminCompanyExportVerificationStatus =
  | "ALL"
  | "DRAFT"
  | "PENDING"
  | "UNDER_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

export type AdminCompanyExportBusinessType =
  | "MANUFACTURER"
  | "SUPPLIER"
  | "EXPORTER"
  | "OEM"
  | "DISTRIBUTOR";

export type AdminCompanyExportStatus =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

export type AdminCompanyExportFeatured =
  | "ALL"
  | "FEATURED"
  | "UNFEATURED";

export interface ExportAdminCompaniesParams {
  search?: string;
  verification_status?: AdminCompanyExportVerificationStatus;
  business_type?: AdminCompanyExportBusinessType | (string & {});
  status?: AdminCompanyExportStatus;
  featured?: AdminCompanyExportFeatured;
  state?: string;
}

/**
 * Export companies as an Excel (.xlsx) file.
 *
 * The endpoint returns CSV, which is converted to .xlsx in the browser.
 */
export async function exportAdminCompanies(
  params: ExportAdminCompaniesParams = {},
): Promise<Blob> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  searchParams.set(
    "verification_status",
    params.verification_status ?? "ALL",
  );

  searchParams.set(
    "status",
    params.status ?? "ALL",
  );

  searchParams.set(
    "featured",
    params.featured ?? "ALL",
  );

  if (params.business_type) {
    searchParams.set(
      "business_type",
      params.business_type,
    );
  }

  if (params.state) {
    searchParams.set(
      "state",
      params.state,
    );
  }

  /*
   * apiRequest returns non-JSON responses as text, and handles the
   * admin proxy, portal header and expired-session refresh for us.
   */
  const csv = await apiRequest<string | null>(
    `/admin/companies/export?${searchParams.toString()}`,
    {
      method: "GET",
      portal: "ADMIN",
      headers: {
        Accept: "text/csv",
      },
    },
  );

  return csvToExcelBlob(csv ?? "", "Companies");
}
