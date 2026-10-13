import type {
  AdminInquiryListItem,
} from "@/lib/api/admin-inquiries-api";

export type InquiryStatus =
  | "New"
  | "Replied"
  | "In Discussion"
  | "Closed"
  | "Spam";

export type InquiryType =
  | "Request Quote"
  | "Contact Supplier";

export interface InquiryRow {
  id: string;

  buyerName: string;
  buyerLocation: string;

  companyName: string;
  companyId: number | null;
  companyLocation: string;

  productName: string;
  productId?: number;
  productSlug?: string;

  inquiryType: InquiryType;

  quantity: string;

  createdDate: string;

  status: InquiryStatus;
}

export function mapInquiryStatus(
  status: AdminInquiryListItem["status"],
): InquiryStatus {
  switch (status) {
    case "REPLIED":
      return "Replied";

    case "IN_DISCUSSION":
      return "In Discussion";

    case "CLOSED":
      return "Closed";

    case "SPAM":
      return "Spam";

    default:
      return "New";
  }
}

export function mapInquiryType(
  type: AdminInquiryListItem["inquiry_type"],
): InquiryType {
  return type === "CONTACT_SUPPLIER"
    ? "Contact Supplier"
    : "Request Quote";
}

export function mapAdminInquiryToRow(
  inquiry: AdminInquiryListItem,
): InquiryRow {
  const companyLocation =
    [
      inquiry.company?.city,
      inquiry.company?.state,
    ]
      .filter(Boolean)
      .join(", ");

  return {
    id:
      inquiry.inquiry_number,

    buyerName:
      inquiry.buyer_name ||
      inquiry.buyer?.name ||
      "Buyer",

    buyerLocation:
      inquiry.buyer_city_state ??
      "Not provided",

    companyName:
      inquiry.company?.name ??
      "No Company",

    companyId:
      inquiry.company?.company_id ??
      null,

    companyLocation:
      companyLocation ||
      "Not provided",

    productName:
      inquiry.product?.name ??
      inquiry.product_requirement,

    productId:
      inquiry.product?.product_id,

    productSlug:
      inquiry.product?.slug,

    inquiryType:
      mapInquiryType(
        inquiry.inquiry_type,
      ),

    quantity:
      inquiry.quantity !== null
        ? `${inquiry.quantity} ${inquiry.quantity_unit ?? ""}`.trim()
        : "Not specified",

    createdDate:
      new Date(
        inquiry.created_at,
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      ),

    status:
      mapInquiryStatus(
        inquiry.status,
      ),
  };
}