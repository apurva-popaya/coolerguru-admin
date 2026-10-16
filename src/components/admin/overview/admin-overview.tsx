"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  MessagesSquare,
  Package,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/common/date-range-picker";
import {
  getAdminDashboard,
  type AdminDashboardCompany,
  type AdminDashboardInquiry,
  type AdminDashboardProduct,
  type AdminDashboardResponse,
} from "@/lib/api/admin-dashboard-api";

import { OverviewMiniTable } from "./overview-mini-table";
import { OverviewStatCard } from "./overview-stat-card";
import { PlatformGrowthChart } from "./platform-growth-chart";
import { UserDistributionChart } from "./user-distribution-chart";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "VERIFIED":
      return "Verified";

    case "APPROVED":
      return "Approved";

    case "REJECTED":
      return "Rejected";

    case "NEW":
      return "New";

    case "REPLIED":
      return "Replied";

    case "IN_DISCUSSION":
      return "In Discussion";

    case "CLOSED":
      return "Closed";

    default:
      return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

function mapCompanies(companies: AdminDashboardCompany[]) {
  return companies.map((company) => ({
    company: company.name,
    location: `${company.city}, ${company.state}`,
    date: formatDate(company.created_at),
    status: formatStatus(company.verification_status),
  }));
}

function mapProducts(products: AdminDashboardProduct[]) {
  return products.map((product) => ({
    product: product.name,
    company: product.company?.name ?? "Unavailable",
    date: formatDate(product.created_at),
    status: formatStatus(product.approval_status),
  }));
}

function mapInquiries(inquiries: AdminDashboardInquiry[]) {
  return inquiries.map((inquiry) => ({
    inquiry: inquiry.inquiry_number,
    buyer: inquiry.buyer_name,
    company: inquiry.company?.name ?? "Unavailable",
    date: formatDate(inquiry.created_at),
    status: formatStatus(inquiry.status),
  }));
}

/**
 * Converts Date object to YYYY-MM-DD.
 *
 * Using local date values avoids timezone-related date shifts.
 */
function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD for displaying to the admin.
 */
function formatSelectedDate(date: string) {
  if (!date) {
    return "";
  }

  const [year, month, day] = date.split("-");

  const parsedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRollingMonthRange() {
  const today = new Date();
  const lastDayOfPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
  );
  // Clamp month-end dates when the previous month has fewer days.
  const oneMonthAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    Math.min(today.getDate(), lastDayOfPreviousMonth.getDate()),
  );

  return {
    from: toInputDate(oneMonthAgo),
    to: toInputDate(today),
  };
}

export function AdminOverview() {
  const [defaultRange] = useState(getRollingMonthRange);

  /*
   * Applied date range.
   *
   * These are the dates actually sent to the API.
   */
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);

  /*
   * Temporary date range used inside the date picker.
   *
   * This allows the admin to select both dates and then press Apply.
   */
  const [draftDateFrom, setDraftDateFrom] = useState(defaultRange.from);
  const [draftDateTo, setDraftDateTo] = useState(defaultRange.to);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse["data"] | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (from: string, to: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminDashboard({
          date_from: from,
          date_to: to,
          granularity: "day",
        });

        setDashboard(response.data);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /*
   * Load dashboard whenever the applied date range changes.
   */
  useEffect(() => {
    void loadDashboard(dateFrom, dateTo);
  }, [dateFrom, dateTo, loadDashboard]);

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      if (event.target instanceof Element && !event.target.closest("[data-admin-date-picker]")) {
        setIsDatePickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown, true);
    };
  }, [isDatePickerOpen]);

  const handleOpenDatePicker = () => {
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setIsDatePickerOpen((previous) => !previous);
  };

  const handleCancelDatePicker = () => {
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setIsDatePickerOpen(false);
  };

  const handleApplyDateRange = () => {
    if (!draftDateFrom || !draftDateTo) {
      return;
    }

    const today = toInputDate(new Date());
    if (draftDateFrom > today || draftDateTo > today) {
      return;
    }

    if (draftDateFrom > draftDateTo) {
      setError("The start date cannot be after the end date.");
      return;
    }

    setError(null);

    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);

    setIsDatePickerOpen(false);
  };

  const summary = dashboard?.summary ?? {
    total_companies: 0,
    pending_company_approvals: 0,
    total_products: 0,
    pending_product_approvals: 0,
    total_users: 0,
    total_inquiries: 0,
  };

  const companies = dashboard?.recent_companies ?? [];

  const products = dashboard?.recent_products ?? [];

  const inquiries = dashboard?.recent_inquiries ?? [];

  /*
   * The backend should now return platform_growth according to
   * the selected date range.
   *
   * Do not use the old static platform growth data here because
   * that would make the chart incorrect for different date ranges.
   */
  const platformGrowth = dashboard?.platform_growth ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Admin Overview"
          description="Welcome back! Here's what's happening on CoolerGuru."
          action={
            <div data-admin-date-picker className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenDatePicker}
                aria-expanded={isDatePickerOpen}
                className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-card px-4 font-semibold text-foreground text-admin-14"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />

                  {formatSelectedDate(dateFrom)} -{" "}
                  {formatSelectedDate(dateTo)}
                </span>

                <ChevronDown
                  data-icon="inline-end"
                  className={`shrink-0 text-muted-foreground transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[140px] animate-pulse rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-[50px] rounded-full bg-[#eef0f7]" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 rounded bg-[#eef0f7]" />

                  <div className="h-8 w-20 rounded bg-[#eef0f7]" />

                  <div className="h-3 w-24 rounded bg-[#eef0f7]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="h-[330px] animate-pulse rounded-2xl border border-border bg-card" />

          <div className="h-[330px] animate-pulse rounded-2xl border border-border bg-card" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[300px] animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Admin Overview"
          description="Welcome back! Here's what's happening on CoolerGuru."
          action={
            <div data-admin-date-picker className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenDatePicker}
                aria-expanded={isDatePickerOpen}
                className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-card px-4 font-semibold text-foreground text-admin-14"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />

                  {formatSelectedDate(dateFrom)} -{" "}
                  {formatSelectedDate(dateTo)}
                </span>

                <ChevronDown
                  data-icon="inline-end"
                  className={`shrink-0 text-muted-foreground transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          }
        />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-600 text-admin-15">
            Unable to load dashboard
          </p>

          <p className="mt-1 text-red-500 text-admin-14">
            {error ?? "Something went wrong while loading the dashboard."}
          </p>

          <Button
            type="button"
            onClick={() => void loadDashboard(dateFrom, dateTo)}
            className="mt-4 bg-primary text-primary-foreground"
          >
            Try Again
          </Button>
        </div>

        {isDatePickerOpen && (
          <DateRangePicker
            draftDateFrom={draftDateFrom}
            draftDateTo={draftDateTo}
            setDraftDateFrom={setDraftDateFrom}
            setDraftDateTo={setDraftDateTo}
            onApply={handleApplyDateRange}
            onCancel={handleCancelDatePicker}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admin Overview"
        description="Welcome back! Here's what's happening on CoolerGuru."
        action={
          <div data-admin-date-picker className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenDatePicker}
              aria-expanded={isDatePickerOpen}
              className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-card px-4 font-semibold text-foreground text-admin-14"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />

                {formatSelectedDate(dateFrom)} -{" "}
                {formatSelectedDate(dateTo)}
              </span>

              <ChevronDown
                data-icon="inline-end"
                className={`shrink-0 text-muted-foreground transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
              />
            </Button>

            {isDatePickerOpen && (
              <DateRangePicker
                draftDateFrom={draftDateFrom}
                draftDateTo={draftDateTo}
                setDraftDateFrom={setDraftDateFrom}
                setDraftDateTo={setDraftDateTo}
                onApply={handleApplyDateRange}
                onCancel={handleCancelDatePicker}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-6">
        <OverviewStatCard
          title="Total Companies"
          value={summary.total_companies}
          icon={Building2}
        />

        <OverviewStatCard
          title="Pending Company Approvals"
          value={summary.pending_company_approvals}
          icon={Clock3}
          subtitle="Awaiting review"
        />

        <OverviewStatCard
          title="Total Products"
          value={summary.total_products}
          icon={Package}
        />

        <OverviewStatCard
          title="Pending Product Approvals"
          value={summary.pending_product_approvals}
          icon={Clock3}
          subtitle="Awaiting review"
        />

        <OverviewStatCard
          title="Total Users"
          value={summary.total_users}
          icon={Users}
        />

        <OverviewStatCard
          title="Total Inquiries"
          value={summary.total_inquiries}
          icon={MessagesSquare}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <PlatformGrowthChart data={platformGrowth} />

        <UserDistributionChart
          data={dashboard.user_distribution}
          totalUsers={summary.total_users}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OverviewMiniTable
          className="xl:col-span-2"
          title="Recent Company Registrations"
          viewAllHref="/companies"
          emptyMessage="No recent company registrations found."
          columns={[
            {
              key: "company",
              label: "Company Name",
              className: "font-medium text-foreground",
            },
            {
              key: "location",
              label: "Location",
            },
            {
              key: "date",
              label: "Date",
            },
            {
              key: "status",
              label: "Status",
            },
          ]}
          data={mapCompanies(companies)}
        />

        <OverviewMiniTable
          title="Recent Product Submissions"
          viewAllHref="/products"
          emptyMessage="No recent product submissions found."
          columns={[
            {
              key: "product",
              label: "Product Name",
              className: "font-medium text-foreground",
            },
            {
              key: "company",
              label: "Company",
            },
            {
              key: "date",
              label: "Date",
            },
            {
              key: "status",
              label: "Status",
            },
          ]}
          data={mapProducts(products)}
        />

        <OverviewMiniTable
          title="Recent Inquiries"
          viewAllHref="/inquiries"
          emptyMessage="No recent inquiries found."
          columns={[
            {
              key: "inquiry",
              label: "Inquiry ID",
              className: "font-medium text-foreground",
            },
            {
              key: "buyer",
              label: "Buyer",
            },
            {
              key: "company",
              label: "Company",
            },
            {
              key: "date",
              label: "Date",
            },
          ]}
          data={mapInquiries(inquiries)}
        />
      </div>
    </div>
  );
}

