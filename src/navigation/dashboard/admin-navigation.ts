import type { DashboardNavGroup } from "./types";

export const adminNavigation: DashboardNavGroup[] = [
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
