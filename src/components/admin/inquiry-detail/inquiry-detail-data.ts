import type {
  AdminInquiryDetail,
  AdminInquiryStatus,
  AdminInquiryType,
} from "@/lib/api/admin-inquiries-api";

import type {
  InquiryStatus,
  InquiryType,
} from "@/components/admin/inquiries/inquiries-data";

export interface InquiryMessage {
  id: string;
  sender: string;
  role: "Buyer" | "Supplier";
  time: string;
  message: string;
}

export interface InquiryAttachment {
  id: string;
  name: string;
  type: "PDF" | "XLSX";
  size: string;
}

export interface InquiryTimelineItem {
  id: string;
  date: string;
  event: string;
}

export interface InquiryDetailData {
  id: string;

  status: InquiryStatus;

  createdDate: string;

  inquiryType: InquiryType;

  quantity: string;

  buyer: {
    id: string;
    name: string;
    company: string;
    location: string;
    email: string;
    phone: string;
    buyerType: string;
  };

  company: {
    id: string;
    name: string;
    contactPerson: string;
    location: string;
    email: string;
    phone: string;
    supplierTypes: string[];
    verified: boolean;
  };

  product: {
    id?: string;
    name: string;
    category: string;
    quantity: string;
    budget: string;
    deliveryLocation: string;
    notes: string;
  };

  originalInquiry: string;

  attachments: InquiryAttachment[];

  messages: InquiryMessage[];

  timeline: InquiryTimelineItem[];

  lastActivity: string;
}

function mapStatus(
  status: AdminInquiryStatus,
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

function mapType(
  type: AdminInquiryType,
): InquiryType {
  return type === "CONTACT_SUPPLIER"
    ? "Contact Supplier"
    : "Request Quote";
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not available";
  }

  return new Date(
    value,
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function getPersonName(
  person:
    | {
        name: string | null;
        first_name: string | null;
        last_name: string | null;
      }
    | null,
  fallback: string,
) {
  if (!person) {
    return fallback;
  }

  return (
    person.name?.trim() ||
    [
      person.first_name,
      person.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    fallback
  );
}

function getBudget(
  inquiry: AdminInquiryDetail,
) {
  const product =
    inquiry.product;

  if (!product) {
    return "Not provided";
  }

  const unit =
    product.price_unit
      ? ` / ${product.price_unit}`
      : "";

  if (
    product.min_price &&
    product.max_price
  ) {
    return `₹${Number(product.min_price).toLocaleString("en-IN")} - ₹${Number(product.max_price).toLocaleString("en-IN")}${unit}`;
  }

  if (product.price) {
    return `₹${Number(product.price).toLocaleString("en-IN")}${unit}`;
  }

  return "Not provided";
}

export function mapAdminInquiryDetail(
  inquiry: AdminInquiryDetail,
): InquiryDetailData {
  const companyLocation =
    [
      inquiry.company?.city,
      inquiry.company?.state,
    ]
      .filter(Boolean)
      .join(", ");

  const contactPerson =
    getPersonName(
      inquiry.company?.owner ??
        null,
      "Not available",
    );

  return {
    id:
      inquiry.inquiry_number,

    status:
      mapStatus(
        inquiry.status,
      ),

    createdDate:
      formatDate(
        inquiry.created_at,
      ),

    inquiryType:
      mapType(
        inquiry.inquiry_type,
      ),

    quantity:
      inquiry.quantity !== null
        ? `${inquiry.quantity} ${inquiry.quantity_unit ?? ""}`.trim()
        : "Not specified",

    buyer: {
      id:
        String(
          inquiry.buyer_user_id,
        ),

      name:
        inquiry.buyer_name ||
        getPersonName(
          inquiry.buyer,
          "Buyer",
        ),

      company: "",

      location:
        inquiry.buyer_city_state ??
        "Not provided",

      email:
        inquiry.buyer_email ??
        inquiry.buyer?.email ??
        "Not provided",

      phone:
        inquiry.buyer_phone_number ??
        inquiry.buyer?.phone_number ??
        "Not provided",

      buyerType:
        "Buyer",
    },

    company: {
      id:
        inquiry.company
          ? String(
              inquiry.company.company_id,
            )
          : "",

      name:
        inquiry.company?.name ??
        "No Company",

      contactPerson,

      location:
        companyLocation ||
        "Not provided",

      email:
        inquiry.company?.email ??
        "Not provided",

      phone:
        inquiry.company?.phone_number ??
        "Not provided",

      supplierTypes:
        inquiry.company?.business_types ??
        [],

      verified:
        inquiry.company?.verification_status ===
        "VERIFIED",
    },

    product: {
      id:
        inquiry.product?.slug,

      name:
        inquiry.product?.name ??
        inquiry.product_requirement,

      category:
        inquiry.product?.category?.name ??
        "Not applicable",

      quantity:
        inquiry.quantity !== null
          ? `${inquiry.quantity} ${inquiry.quantity_unit ?? ""}`.trim()
          : "Not specified",

      budget:
        getBudget(inquiry),

      deliveryLocation:
        "Not provided",

      notes:
        inquiry.requirement_details ??
        inquiry.product_requirement,
    },

    originalInquiry:
      inquiry.requirement_details ??
      inquiry.product_requirement,

    /*
     * Admin inquiry detail API currently
     * does not return attachments.
     */
    attachments: [],

    messages:
      inquiry.messages.map(
        (message) => ({
          id:
            String(
              message.inquiry_message_id,
            ),

          sender:
            getPersonName(
              message.sender,
              message.sender_type ===
                "BUYER"
                ? "Buyer"
                : "Supplier",
            ),

          role:
            message.sender_type ===
            "BUYER"
              ? "Buyer"
              : "Supplier",

          time:
            formatDate(
              message.created_at,
            ),

          message:
            message.message,
        }),
      ),

    timeline:
      inquiry.events.map(
        (event) => ({
          id:
            String(
              event.inquiry_event_id,
            ),

          date:
            formatDate(
              event.created_at,
            ),

          event:
            event.description ||
            event.event_type,
        }),
      ),

    lastActivity:
      formatDate(
        inquiry.last_activity_at,
      ),
  };
}