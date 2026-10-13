import type { AdminProductListItem } from "@/lib/api/admin-products-api";

export type ProductListingStatus = "Active" | "Inactive";

export type ProductStockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductApprovalStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export interface ProductRow {
  id: string;
  slug: string;

  name: string;

  company: string;
  companyId: number | null;

  category: string;
  categoryId: number;

  modelNumber: string;

  price: number | null;

  listingStatus: ProductListingStatus;

  stockStatus: ProductStockStatus;

  approvalStatus: ProductApprovalStatus;

  views: number;

  savedCount: number;

  inquiries: number;

  submittedDate: string;
}

function mapStockStatus(status: AdminProductListItem["availability_status"]): ProductStockStatus {
  switch (status) {
    case "LOW_STOCK":
      return "Low Stock";

    case "OUT_OF_STOCK":
      return "Out of Stock";

    default:
      return "In Stock";
  }
}

function mapApprovalStatus(status: AdminProductListItem["approval_status"]): ProductApprovalStatus {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "UNDER_REVIEW":
      return "Under Review";

    case "REJECTED":
      return "Rejected";

    default:
      return "Approved";
  }
}

export function mapAdminProductToRow(product: AdminProductListItem): ProductRow {
  return {
    id: String(product.product_id),

    slug: product.slug,

    name: product.name || "Unnamed Product",

    company: product.company?.name ?? "No Company",

    companyId: product.company?.company_id ?? null,

    category: product.category.name,

    categoryId: product.category.category_id,

    modelNumber: product.model_number ?? product.sku ?? "-",

    price: product.price !== null ? Number(product.price) : null,

    listingStatus: product.is_active ? "Active" : "Inactive",

    stockStatus: mapStockStatus(product.availability_status),

    approvalStatus: mapApprovalStatus(product.approval_status),

    views: 0,

    savedCount: product._count.saved_by,

    inquiries: product._count.inquiries,

    submittedDate: new Date(product.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}
