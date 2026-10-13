import type {
  AdminUserListItem,
} from "@/lib/api/admin-users-api";

export type UserRole =
  | "Buyer"
  | "Supplier"
  | "Admin";

export type UserStatus =
  | "Active"
  | "Inactive";

export type UserAccountType =
  | "Individual"
  | "Company";

export interface AdminUserRow {
  id: string;

  backendId: number;

  name: string;

  mobile: string;

  email: string;

  roles: UserRole[];

  role: UserRole;

  accountType:
    UserAccountType;

  status:
    UserStatus;

  companyName?: string;

  joinedDate: string;

  lastActivity: string;
}

function mapRole(
  role: string,
): UserRole {
  switch (role) {
    case "SELLER":
      return "Supplier";

    case "ADMIN":
      return "Admin";

    default:
      return "Buyer";
  }
}

function formatDate(
  value: string,
) {
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

export function mapAdminUserToRow(
  user: AdminUserListItem,
): AdminUserRow {
  const roles =
    user.roles.map(
      mapRole,
    );

  return {
    id:
      String(
        user.user_id,
      ),

    backendId:
      user.user_id,

    name:
      user.name?.trim() ||
      "Unnamed User",

    mobile:
      user.phone_number,

    email:
      user.email ?? "",

    roles,

    role:
      roles[0] ??
      "Buyer",

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

    companyName:
      user.company?.name,

    joinedDate:
      formatDate(
        user.joined_at,
      ),

    lastActivity:
      formatDate(
        user.last_activity_at,
      ),
  };
}