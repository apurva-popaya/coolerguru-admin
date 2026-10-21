import { notFound } from "next/navigation";

import { CompanyBilling } from "./_components/company-billing";

import {
  CompanyDetail,
} from "@/components/admin/company-detail/company-detail";

import {
  mapAdminCompanyDetail,
} from "@/components/admin/company-detail/company-detail-data";

import {
  getAdminCompanyDetailServer,
} from "@/lib/api/admin-companies-server-api";

interface AdminCompanyDetailPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function AdminCompanyDetailPage({
  params,
}: AdminCompanyDetailPageProps) {
  const {
    companyId,
  } = await params;

  try {
    const response =
      await getAdminCompanyDetailServer(
        companyId,
      );

    if (!response.data?.company) {
      notFound();
    }

    const company =
      mapAdminCompanyDetail(
        response.data.company,
      );

    return (
      <div className="flex min-w-0 flex-col gap-5">
        <CompanyDetail company={company} />
        <CompanyBilling companyId={company.id} />
      </div>
    );
  } catch (error) {
    console.error(
      "Admin company detail error:",
      error,
    );

    throw error;
  }
}
