import { notFound } from "next/navigation";

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
      <CompanyDetail
        company={company}
      />
    );
  } catch (error) {
    console.error(
      "Admin company detail error:",
      error,
    );

    throw error;
  }
}