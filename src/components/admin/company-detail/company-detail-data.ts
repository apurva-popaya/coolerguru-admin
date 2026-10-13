import type {
  AdminCompanyDetail,
} from "@/lib/api/admin-companies-api";

export type CompanyVerificationStatus =
  | "Pending"
  | "Under Verification"
  | "Verified"
  | "Rejected"
  | "Draft";

export interface CompanyDocument {
  id: string;
  name: string;
  url: string;
}

export interface CompanyProduct {
  id: string;
  name: string;
  category: string;
  status:
    | "Active"
    | "Inactive";
  price: string;
}

export interface CompanyInquiry {
  id: string;
  buyer: string;
  inquiry: string;
  date: string;
  response: string;
  status:
    | "New"
    | "Replied"
    | "Closed";
}

export interface CompanyDetailData {
  id: string;
  slug: string;

  name: string;

  tagline: string;

  location: string;

  businessTypes: string[];

  verificationStatus:
    CompanyVerificationStatus;

  verificationNote:
    string | null;

  featured: boolean;

  featuredPriority:
    number | null;

  joinedDate: string;

  active: boolean;

  supplierName: string;

  supplierPhone: string;

  supplierEmail: string;

  about: string;

  gstNumber: string;

  panNumber: string;

  registrationNumber: string;

  companyType: string;

  yearsInBusiness: string;

  employeeSize: string;

  website: string;

  certifications: string[];

  registeredAddress: string;

  city: string;

  state: string;

  pincode: string;

  businessHours: string;

  contactEmail: string;

  contactPhone: string;

  productsCount: number;

  inquiriesReceived: number;

  sellerResponses: number;

  profileViews: number;

  savedByBuyers: number;

  verificationSubmitted: string;

  rejectionReason?: string;

  documents: CompanyDocument[];

  categories: string[];

  products: CompanyProduct[];

  inquiries: CompanyInquiry[];
}

function mapVerificationStatus(
  status:
    AdminCompanyDetail["verification_status"],
): CompanyVerificationStatus {
  switch (status) {
    case "VERIFIED":
      return "Verified";

    case "REJECTED":
      return "Rejected";

    case "PENDING":
      return "Pending";

    case "DRAFT":
    default:
      return "Draft";
  }
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatBusinessHours(
  businessHours:
    AdminCompanyDetail["business_hours"],
) {
  if (!businessHours) {
    return "-";
  }

  const weekday =
    businessHours.monday_to_friday;

  if (!weekday) {
    return "-";
  }

  if (
    weekday.is_closed
  ) {
    return "Closed";
  }

  if (
    !weekday.open ||
    !weekday.close
  ) {
    return "-";
  }

  return `Mon - Fri: ${weekday.open} - ${weekday.close}`;
}

function buildDocuments(
  company: AdminCompanyDetail,
): CompanyDocument[] {
  const documents: CompanyDocument[] = [];

  if (
    company.gst_certificate_url
  ) {
    documents.push({
      id: "gst",
      name: "GST Certificate",
      url:
        company.gst_certificate_url,
    });
  }

  if (
    company.pan_document_url
  ) {
    documents.push({
      id: "pan",
      name: "PAN Document",
      url:
        company.pan_document_url,
    });
  }

  if (
    company.incorporation_certificate_url
  ) {
    documents.push({
      id: "incorporation",
      name:
        "Incorporation Certificate",
      url:
        company.incorporation_certificate_url,
    });
  }

  if (
    company.shop_establishment_document_url
  ) {
    documents.push({
      id: "shop-establishment",
      name:
        "Shop Establishment Document",
      url:
        company.shop_establishment_document_url,
    });
  }

  if (
    company.brochure_url
  ) {
    documents.push({
      id: "brochure",
      name:
        "Company Brochure",
      url:
        company.brochure_url,
    });
  }

  return documents;
}

function formatPrice(
  price: string | null,
  minPrice: string | null,
  maxPrice: string | null,
  currency: string,
) {
  const format = (value: string) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (price) {
    return format(price);
  }

  if (minPrice && maxPrice) {
    return `${format(minPrice)} - ${format(maxPrice)}`;
  }

  if (minPrice) {
    return `From ${format(minPrice)}`;
  }

  if (maxPrice) {
    return `Up to ${format(maxPrice)}`;
  }

  return "-";
}

function mapInquiryStatus(
  status: string,
  hasResponse: boolean,
): CompanyInquiry["status"] {
  if (status === "NEW") {
    return "New";
  }

  if (
    status === "REPLIED" ||
    status === "IN_DISCUSSION"
  ) {
    return hasResponse ? "Replied" : "New";
  }

  if (status === "CLOSED") {
    return "Closed";
  }

  return hasResponse ? "Replied" : "New";
}

export function mapAdminCompanyDetail(
  company: AdminCompanyDetail,
): CompanyDetailData {
  const supplierName =
    company.owner.name?.trim() ||
    [
      company.owner.first_name,
      company.owner.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Supplier";

  const location = [
    company.city,
    company.state,
  ]
    .filter(Boolean)
    .join(", ");

  const verificationStatus =
    mapVerificationStatus(
      company.verification_status,
    );

  return {
    id: String(
      company.company_id,
    ),

    slug: company.slug,

    name: company.name,

    tagline:
      company.description ?? "",

    location:
      location || "-",

    businessTypes:
      company.business_types ?? [],

    verificationStatus,

    verificationNote:
      company.verification_note,

    featured:
      company.is_featured,

    featuredPriority:
      company.featured_priority,

    joinedDate:
      formatDate(
        company.created_at,
      ),

    active:
      company.is_active,

    supplierName,

    supplierPhone:
      company.owner.phone_number ||
      "-",

    supplierEmail:
      company.owner.email ||
      "-",

    about:
      company.description ||
      "-",

    gstNumber:
      company.gst_number ||
      "-",

    panNumber:
      company.pan_number ||
      "-",

    registrationNumber:
      company.registration_number ||
      "-",

    companyType:
      company.company_type ||
      "-",

    yearsInBusiness:
      company.years_in_business ||
      "-",

    employeeSize:
      company.employee_size ||
      "-",

    website:
      company.website_url ||
      "-",

    certifications:
      company.certifications ?? [],

    registeredAddress:
      company.map_address ||
      company.address ||
      "-",

    city:
      company.city || "-",

    state:
      company.state || "-",

    pincode:
      company.pin_code || "-",

    businessHours:
      formatBusinessHours(
        company.business_hours,
      ),

    contactEmail:
      company.email || "-",

    contactPhone:
      company.phone_number || "-",

    productsCount:
      company._count.products,

    inquiriesReceived:
  company._count?.inquiries ?? 0,

sellerResponses: 0,

profileViews: 0,

savedByBuyers:
  company._count?.saved_by ?? 0,

    verificationSubmitted:
      formatDate(
        company.updated_at,
      ),

    rejectionReason:
      verificationStatus ===
      "Rejected"
        ? company.verification_note ||
          "Company verification was rejected."
        : undefined,

    documents:
      buildDocuments(company),

    /*
     * Current Company Detail API
     * does not return categories,
     * products or inquiries.
     */
    categories: (company.categories ?? []).map(
  (category) => category.name,
),

products: (company.recent_products ?? []).map(
  (product) => ({
    id: String(product.product_id),

    name: product.name,

    category:
      product.category?.name || "-",

    status:
      product.is_active
        ? "Active"
        : "Inactive",

    price: formatPrice(
      product.price,
      product.min_price,
      product.max_price,
      product.currency,
    ),
  }),
),

inquiries: (company.recent_inquiries ?? []).map(
  (inquiry) => ({
    id: String(inquiry.inquiry_id),

    buyer:
      inquiry.buyer_name || "-",

    inquiry:
      inquiry.product_requirement ||
      inquiry.product?.name ||
      "-",

    date:
      formatDate(
        inquiry.last_activity_at ||
        inquiry.created_at,
      ),

    response:
      inquiry.latest_response?.message ||
      "No response yet",

    status:
      mapInquiryStatus(
        inquiry.status,
        Boolean(inquiry.latest_response),
      ),
  }),
),
  };
}