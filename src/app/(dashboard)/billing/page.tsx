import { getAdminCompanyDetailServer } from "@/lib/api/admin-companies-server-api";

import { BillingDashboard } from "./_components/billing-dashboard";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string | string[]; tab?: string | string[] }>;
}) {
  const query = await searchParams;
  const company = Array.isArray(query.company) ? query.company[0] : query.company;
  const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const companyDetails = company && company !== "All"
    ? await getAdminCompanyDetailServer(company)
    : null;
  return (
    <BillingDashboard
      key={`${company ?? "all"}-${tab ?? "subscriptions"}`}
      initialSearch={companyDetails?.data?.company?.name ?? ""}
      initialTab={tab}
    />
  );
}

