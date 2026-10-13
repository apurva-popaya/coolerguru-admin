import { ApiError, type ApiResponse, apiRequest } from "@/lib/api/api-client";
import { fetchAdminExport } from "@/lib/api/admin-export";
import { AUTH_PORTAL_HEADER } from "@/lib/auth/auth-portal";
import { csvToExcelBlob, getFilenameFromDisposition } from "@/lib/csv-to-excel";


export type AdminProductStatus = "ALL" | "ACTIVE" | "INACTIVE";

export type AdminProductStockStatus = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type AdminProductApprovalStatus = "ALL" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface AdminProductsQuery {
  search?: string;
  category_id?: number;
  company_id?: number;
  status?: AdminProductStatus;
  stock_status?: AdminProductStockStatus;
  approval_status?: AdminProductApprovalStatus;
  page?: number;
  limit?: number;
}

export interface AdminProductListItem {
  product_id: number;
  name: string;
  slug: string;
  short_description: string | null;
  sku: string | null;
  model_number: string | null;
  price: string | null;
  currency: string;
  stock_quantity: number | null;
  stock_unit: string;

  availability_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

  is_active: boolean;

  approval_status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

  approval_note: string | null;
  created_at: string;
  updated_at: string;

  category: {
    category_id: number;
    name: string;
    slug: string;
  };

  company: {
    company_id: number;
    name: string;
    slug: string;
  } | null;

  images: {
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];

  _count: {
    inquiries: number;
    saved_by: number;
  };
}

export interface AdminProductsSummary {
  total: number;
  active: number;
  inactive: number;
  approved: number;
  pending_approval: number;
  out_of_stock: number;
}

export interface AdminProductsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminProductsData {
  summary: AdminProductsSummary;
  products: AdminProductListItem[];
  pagination: AdminProductsPagination;
}

export type AdminProductsResponse = ApiResponse<AdminProductsData>;

export async function getAdminProducts(query: AdminProductsQuery = {}) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category_id) {
    params.set("category_id", String(query.category_id));
  }

  if (query.company_id) {
    params.set("company_id", String(query.company_id));
  }

  if (query.status && query.status !== "ALL") {
    params.set("status", query.status);
  }

  if (query.stock_status && query.stock_status !== "ALL") {
    params.set("stock_status", query.stock_status);
  }

  if (query.approval_status && query.approval_status !== "ALL") {
    params.set("approval_status", query.approval_status);
  }

  params.set("page", String(query.page ?? 1));

  params.set("limit", String(query.limit ?? 10));

  return apiRequest<AdminProductsResponse>(`/admin/products?${params.toString()}`, {
    method: "GET",
  });
}

export interface AdminProductDetailCategory {
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner_image: string | null;
  icon: string | null;
  parent_id: number | null;
  can_have_children: boolean;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProductDetailCompany {
  company_id: number;
  name: string;
  slug: string;
}

export interface AdminProductDetailImage {
  product_image_id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface AdminProductDetailItem {
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

  availability_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

  highlights: string[];
  available_colors: string[];
  tags: string[];

  specifications: {
    label?: string;
    value?: string;
    [key: string]: unknown;
  }[];

  video_url: string | null;
  catalogue_url: string | null;
  launched_at: string | null;

  is_featured: boolean;

  approval_status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  is_new_arrival?: string | null;
  new_arrival_by?: number | null;

  approval_note: string | null;
  approval_reviewed_at: string | null;

  category_id: number;

  is_active: boolean;
  deleted_at: string | null;

  created_at: string;
  updated_at: string;

  company_id: number | null;

  category: AdminProductDetailCategory;

  company: AdminProductDetailCompany | null;

  images: AdminProductDetailImage[];

  _count: {
    inquiries: number;
    saved_by: number;
  };
}

export interface AdminProductDetailData {
  product: AdminProductDetailItem;
}

export type AdminProductDetailResponse = ApiResponse<AdminProductDetailData>;

export async function getAdminProductBySlug(slug: string) {
  return apiRequest<AdminProductDetailResponse>(`/admin/products/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
}

export interface UpdateAdminProductPayload {
  is_featured: boolean;
  // Omit when unchanged so featuring a product preserves its original arrival date.
  is_new_arrival?: string;
}

export type UpdateAdminProductResponse = ApiResponse<{
  product: Omit<AdminProductDetailItem, "_count"> & { _count?: AdminProductDetailItem["_count"] };
}>;

export async function updateAdminProduct(slug: string, payload: UpdateAdminProductPayload) {
  try {
    return await apiRequest<UpdateAdminProductResponse>(`/admin/products/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      portal: "ADMIN",
      body: JSON.stringify(payload),
    });
  } catch (cause) {
    if (cause instanceof ApiError && typeof cause.data === "string" && cause.data.includes("Cannot PATCH")) {
      throw new ApiError(
        "The connected backend does not support product editing yet. Please check that the updated backend is running.",
        cause.status,
        cause.data,
      );
    }
    throw cause;
  }
}

export type ProductApprovalDecision = "APPROVED" | "REJECTED";

export interface ReviewProductApprovalPayload {
  status: ProductApprovalDecision;
  note: string;
  is_active: boolean;
}

export type ReviewProductApprovalResponse = ApiResponse<Record<string, unknown>>;

export async function reviewProductApproval(slug: string, payload: ReviewProductApprovalPayload) {
  return apiRequest<ReviewProductApprovalResponse>(`/admin/products/${encodeURIComponent(slug)}/approval`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export async function updateProductActiveStatus(
  slug: string,
  isActive: boolean,
) {
  return apiRequest<ReviewProductApprovalResponse>(
    `/admin/products/${encodeURIComponent(slug)}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "APPROVED",
        is_active: isActive,
      }),
    },
  );
}
export type ExportAdminProductsQuery = Omit<AdminProductsQuery, "page" | "limit">;

export interface AdminProductsExportFile {
  blob: Blob;
  filename: string;
}

/**
 * Export products as an Excel file.
 *
 * The endpoint returns CSV instead of JSON, so it does not use the
 * normal apiRequest helper. The CSV is converted to .xlsx before download.
 */
export async function exportAdminProducts(query: ExportAdminProductsQuery = {}): Promise<AdminProductsExportFile> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category_id) {
    params.set("category_id", String(query.category_id));
  }

  if (query.company_id) {
    params.set("company_id", String(query.company_id));
  }

  if (query.status && query.status !== "ALL") {
    params.set("status", query.status);
  }

  if (query.stock_status && query.stock_status !== "ALL") {
    params.set("stock_status", query.stock_status);
  }

  if (query.approval_status && query.approval_status !== "ALL") {
    params.set("approval_status", query.approval_status);
  }

  const queryString = params.toString();

  const response = await fetchAdminExport(`/products/export${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "text/csv, application/json",
      [AUTH_PORTAL_HEADER]: "ADMIN",
    },
  });

  if (!response.ok) {
    let message = "Unable to export products.";

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

  const baseName = serverFilename?.replace(/\.[^.]+$/, "") || `products-${today}`;

  return {
    blob: await csvToExcelBlob(await response.text(), "Products"),
    filename: `${baseName}.xlsx`,
  };
}
