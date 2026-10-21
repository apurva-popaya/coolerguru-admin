import type { DashboardNavGroup } from "./types";

const navigationItems: DashboardNavGroup[] = [
  {
    id: "admin",
    label: "ADMIN PANEL",

    items: [
      {
        id: "overview",
        title: "Overview",
        href: "/",
        icon: "overview",
      },

      {
        id: "companies",
        title: "Companies",
        href: "/companies",
        icon: "companies",
      },

      {
        id: "products",
        title: "Products",
        href: "/products",
        icon: "products",
      },

      {
        id: "inquiries",
        title: "Inquiries",
        href: "/inquiries",
        icon: "inquiries",
      },

      {
        id: "categories",
        title: "Manage Categories",
        href: "/categories",
        icon: "categories",
      },

      {
        id: "users",
        title: "Manage Users",
        href: "/users",
        icon: "users",
      },

      {
        id: "plans",
        title: "Manage Plans",
        href: "/plans",
        icon: "plans",
      },
      {
        id: "billing",
        title: "Billing",
        href: "/billing",
        icon: "billing",
      },

      // {
      //   id: "featured-companies",
      //   title: "Featured Companies",
      //   href: "/featured-companies",
      //   icon: "featured-companies",
      // },

      // {
      //   id: "activity",
      //   title: "Activity",
      //   href: "/activity",
      //   icon: "activity",
      // },

      {
        id: "analytics",
        title: "Analytics",
        href: "/analytics",
        icon: "analytics",
      },
      {
        id: "ad-banners",
        title: "Content Management",
        href: "/content-management",
        icon: "ad-banners",
      },
    ],
  },
];

export const adminNavigation: DashboardNavGroup[] = [
  { id: "overview", label: "Overview", items: navigationItems[0].items.slice(0, 1) },
  { id: "marketplace", label: "Marketplace", items: navigationItems[0].items.slice(1, 3) },
  { id: "communication", label: "Communication", items: navigationItems[0].items.slice(3, 4) },
  { id: "administration", label: "Administration", items: navigationItems[0].items.slice(4) },
];
