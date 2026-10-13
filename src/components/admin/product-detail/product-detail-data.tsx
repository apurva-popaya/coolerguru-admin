import type {
  ProductApprovalStatus,
  ProductListingStatus,
  ProductStockStatus,
} from "@/components/admin/products/products-data";
import type { AdminProductDetailItem } from "@/lib/api/admin-products-api";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductImageData {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductDetailData {
  id: string;
  productId: number;
  slug: string;

  name: string;

  company: string;
  companyId: number | null;
  companySlug: string | null;

  category: string;
  categoryId: number;

  productType: string;

  modelNumber: string;
  sku: string;
  brand: string;

  shortDescription: string;
  description: string;

  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  priceUnit: string;

  moq: string;

  stockQuantity: number | null;
  stockUnit: string;

  stockStatus: ProductStockStatus;
  listingStatus: ProductListingStatus;
  approvalStatus: ProductApprovalStatus;

  savedCount: number;
  inquiries: number;

  submittedDate: string;
  createdDate: string;
  updatedDate: string;

  applicationUsage: string;
  highlights: string[];
  availableColors: string[];

  specifications: ProductSpecification[];

  tags: string[];

  images: ProductImageData[];

  videoUrl: string | null;
  catalogueUrl: string | null;

  isFeatured: boolean;

  rejectionReason?: string;
  rejectedDate?: string;
}

function mapStockStatus(status: AdminProductDetailItem["availability_status"]): ProductStockStatus {
  switch (status) {
    case "LOW_STOCK":
      return "Low Stock";

    case "OUT_OF_STOCK":
      return "Out of Stock";

    default:
      return "In Stock";
  }
}

function mapApprovalStatus(status: AdminProductDetailItem["approval_status"]): ProductApprovalStatus {
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

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function numberValue(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function normalizeImageUrl(value: string): string {
  const markdownMatch = value.match(/^\[.*?\]\((https?:\/\/.*?)\)$/);

  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return value;
}

function buildSpecifications(product: AdminProductDetailItem): ProductSpecification[] {
  const apiSpecifications = product.specifications
    .map((item) => {
      if (typeof item.label !== "string" || typeof item.value !== "string") {
        return null;
      }

      return {
        label: item.label,

        value: item.value,
      };
    })
    .filter((item): item is ProductSpecification => item !== null);

  if (apiSpecifications.length > 0) {
    return apiSpecifications;
  }

  const specifications: ProductSpecification[] = [];

  function add(label: string, value: string | null | undefined) {
    if (value && value.trim()) {
      specifications.push({
        label,
        value,
      });
    }
  }

  add("Airflow", product.airflow);

  add("Tank Capacity", product.tank_capacity);

  add("Power", product.power);

  add("Coverage Area", product.coverage_area);

  if (product.cooling_capacity) {
    add(
      "Cooling Capacity",
      `${product.cooling_capacity}${product.cooling_capacity_unit ? ` ${product.cooling_capacity_unit}` : ""}`,
    );
  }

  add("Motor Power", product.power_motor);

  add("Voltage / Frequency", product.voltage_frequency);

  add("Material", product.material);

  add("Dimensions", product.dimensions);

  if (product.weight) {
    add("Weight", `${product.weight}${product.weight_unit ? ` ${product.weight_unit}` : ""}`);
  }

  add("Color / Finish", product.color_finish);

  return specifications;
}

export function mapAdminProductDetail(product: AdminProductDetailItem): ProductDetailData {
  const rejected = product.approval_status === "REJECTED";

  return {
    id: product.slug,

    productId: product.product_id,

    slug: product.slug,

    name: product.name || "Unnamed Product",

    company: product.company?.name ?? "No Company Assigned",

    companyId: product.company?.company_id ?? null,

    companySlug: product.company?.slug ?? null,

    category: product.category.name,

    categoryId: product.category.category_id,

    productType: product.product_type ?? "-",

    modelNumber: product.model_number ?? "-",

    sku: product.sku ?? "-",

    brand: product.brand ?? "-",

    shortDescription: product.short_description ?? "-",

    description: product.description ?? product.short_description ?? "-",

    price: numberValue(product.price),

    minPrice: numberValue(product.min_price),

    maxPrice: numberValue(product.max_price),

    currency: product.currency,

    priceUnit: product.price_unit ?? "-",

    moq: product.moq !== null ? `${product.moq} ${product.moq_unit ?? ""}`.trim() : "-",

    stockQuantity: product.stock_quantity,

    stockUnit: product.stock_unit ?? "Units",

    stockStatus: mapStockStatus(product.availability_status),

    listingStatus: product.is_active ? "Active" : "Inactive",

    approvalStatus: mapApprovalStatus(product.approval_status),

    savedCount: product._count.saved_by,

    inquiries: product._count.inquiries,

    submittedDate: formatDate(product.created_at),

    createdDate: formatDate(product.created_at),

    updatedDate: formatDate(product.updated_at),

    applicationUsage: product.application_usage ?? "-",

    highlights: product.highlights,

    availableColors: product.available_colors,

    specifications: buildSpecifications(product),

    tags: product.tags,

    images: product.images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.product_image_id,

        url: normalizeImageUrl(image.image_url),

        alt: image.alt_text ?? product.name,

        isPrimary: image.is_primary,
      })),

    videoUrl: product.video_url,

    catalogueUrl: product.catalogue_url,

    isFeatured: product.is_featured,

    rejectionReason: rejected ? (product.approval_note ?? "No rejection reason provided.") : undefined,

    rejectedDate: rejected ? formatDate(product.approval_reviewed_at) : undefined,
  };
}
