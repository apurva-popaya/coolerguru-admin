"use client";

import { cn } from "cn";
import { useEffect } from "react";

import { usePathname } from "next/navigation";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import type { DashboardNavGroup } from "@/navigation/dashboard/types";

import { DashboardNav } from "./dashboard-nav";

interface DashboardSidebarProps {
  navigation: DashboardNavGroup[];
}

export function DashboardSidebar({ navigation }: DashboardSidebarProps) {
  const { state, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  useEffect(() => {
    const viewport = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (viewport.matches) setOpenMobile(false);
    };
    viewport.addEventListener("change", closeOnDesktop);
    return () => viewport.removeEventListener("change", closeOnDesktop);
  }, [setOpenMobile]);

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 self-stretch border-r border-border bg-background transition-[width] duration-200 lg:block",
          state === "expanded" ? "w-[250px] 2xl:w-[280px]" : "w-[62px]",
        )}
      >
        <div className="sticky top-20 flex h-[calc(100svh-80px)] flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
          <DashboardNav groups={navigation} />
          </div>
          {state === "expanded" && (
            <div className="m-3 rounded-xl bg-muted p-4">
              <p className="text-xs font-semibold text-foreground">CoolerGuru Admin</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Manage your platform in one place.</p>
            </div>
          )}
        </div>
      </aside>
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          id="admin-mobile-navigation"
          side="left"
          className="admin-ui data-[side=left]:w-[min(85vw,320px)] gap-0 overflow-y-auto p-0"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("admin-navigation-toggle")?.focus();
          }}
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Manage your CoolerGuru platform.</SheetDescription>
          </SheetHeader>
          <DashboardNav groups={navigation} forceExpanded onNavigate={() => setOpenMobile(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
