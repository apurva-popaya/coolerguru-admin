import type {
  AdminCompanyDetail,
  AdminCompanyVerificationStatus,
} from "@/lib/api/admin-companies-api";

export type CompanyVerificationStatus =
  | "Draft"
  | "Pending"
  | "Under Verification"
  | "Verified"
  | "Rejected";

export type CompanyBusinessType =
  | "Manufacturer"
  | "Supplier"
  | "Exporter"
  | "Distributor"
  | "Trader"
  | string;

export interface CompanyRow {
  id: string;

  companyId: number;

  name: string;

  logo?: string;

  location: string;

  businessType: CompanyBusinessType;

  businessTypes: string[];

  verificationStatus: CompanyVerificationStatus;

  rawVerificationStatus: AdminCompanyVerificationStatus;

  productsCount: number;

  inquiriesReceived: number | null;

  featured: boolean;

  featuredPriority: number | null;

  joinedDate: string;

  isActive: boolean;

  slug: string;
}

function formatVerificationStatus(
  status: AdminCompanyVerificationStatus,
): CompanyVerificationStatus {
  switch (status) {
    case "DRAFT":
      return "Draft";

    case "PENDING":
      return "Pending";

    case "UNDER_VERIFICATION":
      return "Under Verification";

    case "VERIFIED":
      return "Verified";

    case "REJECTED":
      return "Rejected";

    default:
      return "Pending";
  }
}

function formatLocation(
  city: string | null,
  state: string | null,
) {
  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "—";
}

function formatJoinedDate(
  date: string,
) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getBusinessType(
  company: AdminCompanyDetail,
) {
  if (company.business_types?.length) {
    return company.business_types[0];
  }

  return company.company_type || "—";
}

export function mapAdminCompanyToRow(
  company: AdminCompanyDetail,
): CompanyRow {
  return {
    id: String(company.company_id),

    companyId: company.company_id,

    name: company.name,

    logo:
      company.company_logo_url || undefined,

    location: formatLocation(
      company.city,
      company.state,
    ),

    businessType:
      getBusinessType(company),

    businessTypes:
      company.business_types ?? [],

    verificationStatus:
      formatVerificationStatus(
        company.verification_status,
      ),

    rawVerificationStatus:
      company.verification_status,

    productsCount:
      company._count?.products ?? 0,

    // Not currently provided by the API.
    inquiriesReceived:
  company._count?.inquiries ?? 0,

    featured:
      company.is_featured,

    featuredPriority: company.featured_priority ?? null,

    joinedDate:
      formatJoinedDate(
        company.created_at,
      ),

    isActive:
      company.is_active,

    slug:
      company.slug,
  };
}

export const companyFilterOptions = {
  verificationStatus: [
    "All",
    "Draft",
    "Pending",
    "Under Verification",
    "Verified",
    "Rejected",
  ],

  businessType: [
    "All",
    "Manufacturer",
    "Supplier",
    "Exporter",
    "Distributor",
    "Dealer",
    "Trader",
    "OEM",
  ],

  location: [
    "All",
  ],

  featured: [
    "All",
    "Featured",
    "Not Featured",
  ],
} as const;
