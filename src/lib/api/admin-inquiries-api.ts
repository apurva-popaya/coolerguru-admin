import {
  apiRequest,
  type ApiResponse,
} from "@/lib/api/api-client";
import { fetchAdminExport } from "@/lib/api/admin-export";
import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import { csvToExcelBlob, getFilenameFromDisposition } from "@/lib/csv-to-excel";


export type AdminInquiryStatus =
  | "NEW"
  | "REPLIED"
  | "IN_DISCUSSION"
  | "CLOSED"
  | "SPAM";

export type AdminInquiryType =
  | "REQUEST_QUOTE"
  | "CONTACT_SUPPLIER";

export interface AdminInquiriesQuery {
  search?: string;
  inquiry_type?: AdminInquiryType;
  status?: AdminInquiryStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface AdminInquirySummary {
  total: number;
  new: number;
  replied: number;
  in_discussion: number;
  closed: number;
  spam: number;
}

export interface AdminInquiryCompany {
  company_id: number;
  name: string;
  slug: string;
  company_logo_url: string | null;
  city: string | null;
  state: string | null;
  business_types: string[];
  verification_status: string;
}

export interface AdminInquiryProductListItem {
  product_id: number;
  name: string;
  slug: string;
  model_number: string | null;

  category: {
    category_id: number;
    name: string;
    slug: string;
  } | null;

  images: {
    image_url: string;
    alt_text: string | null;
  }[];
}

export interface AdminInquiryListItem {
  inquiry_id: number;
  inquiry_number: string;
  inquiry_type: AdminInquiryType;
  status: AdminInquiryStatus;
  product_requirement: string;
  quantity: number | null;
  quantity_unit: string | null;
  buyer_name: string;
  buyer_phone_number: string | null;
  buyer_email: string | null;
  buyer_city_state: string | null;
  created_at: string;
  last_activity_at: string;

  buyer: {
    user_id: number;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;

  company: AdminInquiryCompany | null;

  product: AdminInquiryProductListItem | null;
}

export interface AdminInquiryPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminInquiriesData {
  inquiries: AdminInquiryListItem[];
  pagination: AdminInquiryPagination;
}

export interface AdminInquirySpecification {
  key: string;
  unit: string | null;
  label: string;
  value: string;
  sort_order: number;
  is_highlight: boolean;
}

export interface AdminInquiryDetailProduct {
  product_id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: string | null;
  min_price: string | null;
  max_price: string | null;
  currency: string;
  price_unit: string | null;
  sku: string | null;
  model_number: string | null;
  brand: string | null;
  hsn_code: string | null;
  product_type: string | null;
  application_usage: string | null;
  airflow: string | null;
  tank_capacity: string | null;
  power: string | null;
  coverage_area: string | null;
  cooling_capacity: string | null;
  cooling_capacity_unit: string | null;
  power_motor: string | null;
  voltage_frequency: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  weight_unit: string | null;
  color_finish: string | null;
  moq: number | null;
  moq_unit: string | null;
  stock_quantity: number | null;
  stock_unit: string | null;
  availability_status: string;
  highlights: string[];
  available_colors: string[];
  tags: string[];
  specifications: AdminInquirySpecification[];
  video_url: string | null;
  catalogue_url: string | null;
  launched_at: string | null;
  is_featured: boolean;
  approval_status: string;
  approval_note: string | null;
  approval_reviewed_at: string | null;
  category_id: number;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  company_id: number | null;

  category: {
    category_id: number;
    name: string;
    slug: string;
  } | null;

  images: {
    product_image_id: number;
    product_id: number;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
  }[];
}

export interface AdminInquiryMessage {
  inquiry_message_id: number;
  inquiry_id: number;
  sender_user_id: number;
  sender_type: string;
  message: string;
  created_at: string;

  sender: {
    user_id: number;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminInquiryEvent {
  inquiry_event_id: number;
  inquiry_id: number;
  actor_user_id: number | null;
  event_type: string;
  previous_status: string | null;
  new_status: string | null;
  description: string;
  created_at: string;

  actor: {
    user_id: number;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminInquiryDetail {
  inquiry_id: number;
  inquiry_number: string;
  buyer_user_id: number;
  company_id: number | null;
  product_id: number | null;
  inquiry_type: AdminInquiryType;
  status: AdminInquiryStatus;
  product_requirement: string;
  quantity: number | null;
  quantity_unit: string | null;
  buyer_name: string;
  buyer_phone_number: string | null;
  buyer_email: string | null;
  buyer_city_state: string | null;
  requirement_details: string | null;
  viewed_at: string | null;
  first_replied_at: string | null;
  closed_at: string | null;
  spam_reported_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;

  buyer: {
    user_id: number;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    email: string | null;
  } | null;

  company: {
    company_id: number;
    owner_user_id: number;
    name: string;
    slug: string;
    company_logo_url: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    business_types: string[];
    verification_status: string;

    owner: {
      user_id: number;
      name: string | null;
      first_name: string | null;
      last_name: string | null;
      phone_number: string | null;
      email: string | null;
    } | null;
  } | null;

  product: AdminInquiryDetailProduct | null;

  messages: AdminInquiryMessage[];

  events: AdminInquiryEvent[];
}

export async function getAdminInquirySummary() {
  return apiRequest<ApiResponse<{ summary: AdminInquirySummary }>>(
    "/admin/inquiries/summary",
    {
      method: "GET",
    },
  );
}

export async function getAdminInquiries(
  query: AdminInquiriesQuery = {},
) {
  const params =
    new URLSearchParams();

  if (query.search?.trim()) {
    params.set(
      "search",
      query.search.trim(),
    );
  }

  if (query.inquiry_type) {
    params.set(
      "inquiry_type",
      query.inquiry_type,
    );
  }

  if (query.status) {
    params.set(
      "status",
      query.status,
    );
  }

  if (query.date_from) {
    params.set(
      "date_from",
      query.date_from,
    );
  }

  if (query.date_to) {
    params.set(
      "date_to",
      query.date_to,
    );
  }

  params.set(
    "page",
    String(query.page ?? 1),
  );

  params.set(
    "limit",
    String(query.limit ?? 10),
  );

  return apiRequest<ApiResponse<AdminInquiriesData>>(
    `/admin/inquiries?${params.toString()}`,
    {
      method: "GET",
    },
  );
}

export async function getAdminInquiryDetails(
  inquiryNumber: string,
) {
  return apiRequest<ApiResponse<{ inquiry: AdminInquiryDetail }>>(
    `/admin/inquiries/${encodeURIComponent(inquiryNumber)}`,
    {
      method: "GET",
    },
  );
}
export type ExportAdminInquiriesQuery = Omit<AdminInquiriesQuery, "page" | "limit">;

export interface AdminInquiriesExportFile {
  blob: Blob;
  filename: string;
}

/**
 * Export inquiries as a downloadable file.
 *
 * This endpoint returns a file instead of JSON, so it does not use
 * the normal apiRequest helper. The X-Auth-Portal header tells the
 * backend to use the admin cookies.
 */
export async function exportAdminInquiries(
  query: ExportAdminInquiriesQuery = {},
): Promise<AdminInquiriesExportFile> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.inquiry_type) {
    params.set("inquiry_type", query.inquiry_type);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.date_from) {
    params.set("date_from", query.date_from);
  }

  if (query.date_to) {
    params.set("date_to", query.date_to);
  }

  const queryString = params.toString();

  const response = await fetchAdminExport(
    `/admin/inquiries/export${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "text/csv, application/json",
        [AUTH_PORTAL_HEADER]: "ADMIN",
      },
    },
  );

  if (!response.ok) {
    let message = "Unable to export inquiries.";

    try {
      const errorData = await response.json();

      if (errorData && typeof errorData.message === "string") {
        message = errorData.message;
      }
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(message);
  }

  const today = new Date().toISOString().split("T")[0];

  const serverFilename = getFilenameFromDisposition(response.headers.get("content-disposition"));

  // The API sends CSV; convert it so admins get a proper Excel workbook.
  const baseName = serverFilename?.replace(/\.[^.]+$/, "") || `inquiries-${today}`;

  return {
    blob: await csvToExcelBlob(await response.text(), "Inquiries"),
    filename: `${baseName}.xlsx`,
  };
}
