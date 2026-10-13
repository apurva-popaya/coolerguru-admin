"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  Heart,
  ImageIcon,
  Layers3,
  LayoutDashboard,
  MessagesSquare,
  Package,
  PackageCheck,
  Star,
  Users,
} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import type { DashboardIconName, DashboardNavGroup } from "@/navigation/dashboard/types";

interface DashboardNavProps {
  groups: DashboardNavGroup[];
  forceExpanded?: boolean;
  onNavigate?: () => void;
}

function getIcon(iconName: DashboardIconName) {
  switch (iconName) {
    case "overview":
      return LayoutDashboard;

    case "company-approvals":
      return ClipboardCheck;

    case "product-approvals":
      return PackageCheck;

    case "companies":
    case "company-profile":
      return Building2;

    case "products":
      return Package;

    case "inquiries":
      return MessagesSquare;

    case "categories":
      return Layers3;

    case "users":
      return Users;

    case "featured-companies":
      return Star;

    case "activity":
      return Activity;

    case "analytics":
      return ChartNoAxesCombined;
    case "ad-banners":
      return ImageIcon;

    case "saved-products":
      return Heart;

    case "saved-companies":
      return Building2;

    default:
      return LayoutDashboard;
  }
}

export function DashboardNav({ groups, forceExpanded = false, onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  const { state } = useSidebar();

  const expanded = forceExpanded || state === "expanded";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="py-5">
      {groups.map((group) => (
        <div key={group.id} className={expanded ? "px-3" : "px-2"}>
          {group.label && expanded ? (
            <p className="mb-3 px-2 font-bold text-[#15136f] text-admin-14 uppercase tracking-[0.03em]">{group.label}</p>
          ) : null}

          <nav className="flex flex-col gap-[2px]">
            {group.items.map((item) => {
              const Icon = getIcon(item.icon);

              const active = isActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.title}
                  title={!expanded ? item.title : undefined}
                  className={`flex min-h-11 py-2 items-center rounded-[6px] font-semibold text-admin-14 transition ${expanded ? "gap-3 px-3" : "justify-center px-0"} ${active ? "!text-[#2720a8] bg-[#f0efff]" : "!text-[#292e55] hover:!text-[#2720a8] hover:bg-[#f7f6ff]"}`}
                >
                  <Icon size={16} className="shrink-0" />

                  {expanded ? <span className="break-words">{item.title}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
