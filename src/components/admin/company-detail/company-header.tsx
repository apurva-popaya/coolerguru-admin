import { Building2, CalendarDays, MapPin, Star } from "lucide-react";

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

export function CompanyHeader({ company }: { company: CompanyDetailData }) {
  return (
    <div className="rounded-[9px] border border-border bg-white p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 sm:size-[84px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-[#fafaff]">
            <Building2 className="size-9 text-[#2720a8]" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-[#15136f] text-admin-26">{company.name}</h1>

            <p className="mt-1 text-[#5d6280] text-admin-14">{company.tagline}</p>

            <div className="mt-3 flex items-center gap-2 text-[#5d6280] text-admin-14">
              <MapPin className="size-4 text-[#2720a8]" />

              {company.location}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <HeaderInfo title="Verification" icon={<Building2 className="size-4" />}>
            <StatusBadge variant={getStatusVariant(company.verificationStatus)}>
              {company.verificationStatus}
            </StatusBadge>
          </HeaderInfo>

          <HeaderInfo title="Featured" icon={<Star className="size-4" />}>
            <span className="font-semibold text-[#15136f] text-admin-14">{company.featured ? "Yes" : "No"}</span>
          </HeaderInfo>

          <HeaderInfo title="Joined" icon={<CalendarDays className="size-4" />}>
            <span className="font-semibold text-[#15136f] text-admin-14">{company.joinedDate}</span>
          </HeaderInfo>
        </div>
      </div>
    </div>
  );
}

function HeaderInfo({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 sm:min-w-[145px] rounded-[8px] border border-border bg-[#fcfcff] px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-[#5d6280] text-admin-14">
        <span className="text-[#2720a8]">{icon}</span>

        {title}
      </div>

      {children}
    </div>
  );
}