import { Building2, CalendarDays, MapPin, Star } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";

import type { CompanyDetailData } from "./company-detail-data";

function getStatusVariant(status: CompanyDetailData["verificationStatus"]): StatusVariant {
  switch (status) {
    case "Verified":
      return "success";

    case "Pending":
      return "warning";

    case "Under Verification":
      return "info";

    case "Rejected":
      return "danger";

    default:
      return "neutral";
  }
}

export function CompanyHeader({ company, action }: { company: CompanyDetailData; action?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-accent sm:size-16">
              <Building2 aria-hidden="true" className="size-7 text-primary" />
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-admin-26">{company.name}</h1>

              <p className="mt-1 text-muted-foreground text-admin-14">{company.tagline}</p>

              <div className="mt-3 flex items-center gap-2 text-muted-foreground text-admin-14">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />

                {company.location}
              </div>
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <HeaderInfo title="Verification" icon={<Building2 className="size-4" />}>
            <StatusBadge variant={getStatusVariant(company.verificationStatus)}>
              {company.verificationStatus}
            </StatusBadge>
          </HeaderInfo>

          <HeaderInfo title="Featured" icon={<Star className="size-4" />}>
            <span className="font-semibold text-foreground text-admin-14">{company.featured ? "Yes" : "No"}</span>
          </HeaderInfo>

          <HeaderInfo title="Joined" icon={<CalendarDays className="size-4" />}>
            <span className="font-semibold text-foreground text-admin-14">{company.joinedDate}</span>
          </HeaderInfo>
        </div>
      </div>
    </div>
  );
}

function HeaderInfo({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-muted/50 px-3 py-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="text-primary">{icon}</span>

        {title}
      </div>

      {children}
    </div>
  );
}
