import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AdminFooter } from "@/components/admin/layout/admin-footer";
import { Container } from "@/components/common/container";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getServerAuthUser } from "@/lib/auth/server-auth";
import { adminNavigation } from "@/navigation/dashboard/admin-navigation";

// const adminUser = {
//   name: "Admin User",
//   subtitle: "Administrator",
// };

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Only the admin session counts here; a buyer or seller session in the same browser is ignored.
  const user = await getServerAuthUser("ADMIN");

  if (!user || user.active_portal !== "ADMIN" || !user.roles.includes("ADMIN")) {
    redirect("/login");
  }

  const adminName = user.name?.trim() || [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Admin";

  const adminUser = {
    name: adminName,
    subtitle: "Administrator",
  };

  return (
    <div className="min-h-screen bg-background">
      <Container className="max-w-[2400px]! px-0!">
        <DashboardShell
          navigation={adminNavigation}
          homeHref="/"
          user={adminUser}
          searchPlaceholder="Search by company, product, category or user..."
        >
          {children}
        </DashboardShell>

        <AdminFooter />
      </Container>
    </div>
  );
}
