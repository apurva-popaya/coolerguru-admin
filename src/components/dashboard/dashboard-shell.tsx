import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import type { DashboardNavGroup } from "@/navigation/dashboard/types";

import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import type { DashboardUser } from "./dashboard-user-menu";

interface DashboardShellProps {
  children: ReactNode;
  navigation: DashboardNavGroup[];
  homeHref: string;
  user: DashboardUser;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function DashboardShell({
  children,
  navigation,
  homeHref,
  user,
  showSearch = true,
  searchPlaceholder,
}: DashboardShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      className="min-h-0"
      style={
        {
          "--sidebar-width": "250px",
          "--sidebar-width-icon": "62px",
        } as React.CSSProperties
      }
    >
      <div className="admin-ui flex min-h-svh w-full min-w-0 flex-col bg-primary/7">
        <DashboardNavbar
          user={user}
          homeHref={homeHref}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
        />

        <div className="flex flex-1">
          <DashboardSidebar navigation={navigation} />

          <main className="admin-content min-w-0 flex-1 px-4 py-5 text-sm sm:px-6 lg:p-7 2xl:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
