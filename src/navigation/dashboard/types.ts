export type DashboardIconName =
  | "overview"
  | "company-approvals"
  | "product-approvals"
  | "companies"
  | "products"
  | "inquiries"
  | "categories"
  | "users"
  | "plans"
  | "billing"
  | "featured-companies"
  | "activity"
  | "analytics"
  | "ad-banners"
  | "company-profile"
  | "saved-products"
  | "saved-companies";

export interface DashboardNavItem {
  id: string;
  title: string;
  href: string;
  icon: DashboardIconName;
  disabled?: boolean;
}

export interface DashboardNavGroup {
  id: string;
  label?: string;
  items: DashboardNavItem[];
}
