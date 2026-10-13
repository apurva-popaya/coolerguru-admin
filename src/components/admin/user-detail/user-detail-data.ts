import type {
  AdminUserActivityItem,
  AdminUserDetail,
} from "@/lib/api/admin-users-api";

export type UserDisplayRole =
  | "Buyer"
  | "Supplier"
  | "Admin";

export type UserDisplayStatus =
  | "Active"
  | "Inactive";

export interface UserActivity {
  id: string;

  type: string;

  title: string;

  date: string;
}

export interface BuyerStats {
  savedProducts: number;

  savedCompanies: number;

  productsViewed: number;

  companiesViewed: number;

  inquiriesSent: number;

  companiesContacted: number;
}

export interface SupplierStats {
  company: string;

  companyId: string;

  products: number;

  inquiriesReceived: number;

  repliesSent: number;

  verification:
    | "Verified"
    | "Under Verification"
    | "Rejected"
    | "Draft";
}

export interface UserDetailData {
  id: string;

  name: string;

  mobile: string;

  email: string;

  role: UserDisplayRole;

  roles: UserDisplayRole[];

  accountType: string;

  status: UserDisplayStatus;

  location: string;

  registrationDate: string;

  lastActivity: string;

  buyerStats?: BuyerStats;

  supplierStats?: SupplierStats;

  activities: UserActivity[];
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString(
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

function mapRole(
  role: string,
): UserDisplayRole {
  switch (role) {
    case "SELLER":
      return "Supplier";

    case "ADMIN":
      return "Admin";

    default:
      return "Buyer";
  }
}

function mapVerificationStatus(
  value?: string,
): SupplierStats["verification"] {
  switch (value) {
    case "VERIFIED":
      return "Verified";

    case "UNDER_VERIFICATION":
      return "Under Verification";

    case "REJECTED":
      return "Rejected";

    default:
      return "Draft";
  }
}

function readMetric(
  source: Record<string, unknown> | null,
  keys: string[],
) {
  if (!source) {
    return 0;
  }

  for (const key of keys) {
    const value =
      source[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return 0;
}

function mapActivities(
  activities: AdminUserActivityItem[],
): UserActivity[] {
  return activities.map(
    (
      activity,
      index,
    ) => {
      const id =
        String(
          activity.id ??
            activity.activity_id ??
            activity.user_activity_id ??
            index,
        );

      const type =
        String(
          activity.type ??
            activity.activity_type ??
            "Activity",
        );

      const title =
        String(
          activity.title ??
            activity.description ??
            activity.action ??
            "User activity",
        );

      const dateValue =
        activity.created_at ??
        activity.date ??
        activity.occurred_at;

      return {
        id,

        type,

        title,

        date:
          typeof dateValue ===
          "string"
            ? formatDate(
                dateValue,
              )
            : "Not available",
      };
    },
  );
}

export function mapAdminUserDetail(
  user: AdminUserDetail,
  activities: AdminUserActivityItem[],
): UserDetailData {
  const roles =
    user.roles.map(
      mapRole,
    );

  const primaryRole =
    roles.includes(
      "Supplier",
    )
      ? "Supplier"
      : roles.includes(
            "Buyer",
          )
        ? "Buyer"
        : "Admin";

  const buyerStats =
    user.buyer_metrics
      ? {
          savedProducts:
            readMetric(
              user.buyer_metrics,
              [
                "saved_products",
                "savedProducts",
              ],
            ),

          savedCompanies:
            readMetric(
              user.buyer_metrics,
              [
                "saved_companies",
                "savedCompanies",
              ],
            ),

          productsViewed:
            readMetric(
              user.buyer_metrics,
              [
                "products_viewed",
                "product_views",
                "productsViewed",
              ],
            ),

          companiesViewed:
            readMetric(
              user.buyer_metrics,
              [
                "companies_viewed",
                "company_views",
                "companiesViewed",
              ],
            ),

          inquiriesSent:
            readMetric(
              user.buyer_metrics,
              [
                "inquiries_sent",
                "inquiries",
                "inquiriesSent",
              ],
            ),

          companiesContacted:
            readMetric(
              user.buyer_metrics,
              [
                "companies_contacted",
                "companiesContacted",
              ],
            ),
        }
      : undefined;

  const supplierStats =
    user.company
      ? {
          company:
            user.company.name,

          companyId:
            String(
              user.company.company_id,
            ),

          products:
            readMetric(
              user.supplier_metrics,
              [
                "products",
                "product_count",
                "active_products",
              ],
            ),

          inquiriesReceived:
            readMetric(
              user.supplier_metrics,
              [
                "inquiries_received",
                "inquiries",
              ],
            ),

          repliesSent:
            readMetric(
              user.supplier_metrics,
              [
                "replies_sent",
                "replies",
              ],
            ),

          verification:
            mapVerificationStatus(
              user.company.verification_status,
            ),
        }
      : undefined;

  return {
    id:
      String(
        user.user_id,
      ),

    name:
      user.name?.trim() ||
      [
        user.first_name,
        user.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      `User #${user.user_id}`,

    mobile:
      user.phone_number,

    email:
      user.email ?? "",

    role:
      primaryRole,

    roles,

    accountType:
      user.account_type ===
      "COMPANY"
        ? "Company"
        : "Individual",

    status:
      user.status ===
      "ACTIVE"
        ? "Active"
        : "Inactive",

    location:
      user.company
        ? [
            user.company.name,
          ]
            .filter(Boolean)
            .join(", ")
        : "Not available",

    registrationDate:
      formatDate(
        user.joined_at,
      ),

    lastActivity:
      formatDate(
        user.last_activity_at,
      ),

    buyerStats,

    supplierStats,

    activities:
      mapActivities(
        activities,
      ),
  };
}