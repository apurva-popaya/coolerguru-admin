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
  X,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
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
    company: product.company.name,
    date: formatDate(product.created_at),
    status: formatStatus(product.approval_status),
  }));
}

function mapInquiries(inquiries: AdminDashboardInquiry[]) {
  return inquiries.map((inquiry) => ({
    inquiry: inquiry.inquiry_number,
    buyer: inquiry.buyer_name,
    company: inquiry.company.name,
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

function getCurrentMonthRange() {
  const today = new Date();

  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  const lastDay = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  );

  return {
    from: toInputDate(firstDay),
    to: toInputDate(lastDay),
  };
}

export function AdminOverview() {
  const currentMonth = getCurrentMonthRange();

  /*
   * Applied date range.
   *
   * These are the dates actually sent to the API.
   */
  const [dateFrom, setDateFrom] = useState(currentMonth.from);
  const [dateTo, setDateTo] = useState(currentMonth.to);

  /*
   * Temporary date range used inside the date picker.
   *
   * This allows the admin to select both dates and then press Apply.
   */
  const [draftDateFrom, setDraftDateFrom] = useState(currentMonth.from);
  const [draftDateTo, setDraftDateTo] = useState(currentMonth.to);

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
    setIsDatePickerOpen(true);
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
                className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-white px-4 font-semibold text-[#15136f] text-admin-14"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#2720a8]" />

                  {formatSelectedDate(dateFrom)} -{" "}
                  {formatSelectedDate(dateTo)}
                </span>

                <ChevronDown
                  data-icon="inline-end"
                  className={`shrink-0 text-[#5d6280] transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[140px] animate-pulse rounded-[8px] border border-[#e3e6f3] bg-white p-4"
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
          <div className="h-[330px] animate-pulse rounded-[8px] border border-[#e3e6f3] bg-white" />

          <div className="h-[330px] animate-pulse rounded-[8px] border border-[#e3e6f3] bg-white" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[300px] animate-pulse rounded-[8px] border border-[#e3e6f3] bg-white"
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
                className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-white px-4 font-semibold text-[#15136f] text-admin-14"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#2720a8]" />

                  {formatSelectedDate(dateFrom)} -{" "}
                  {formatSelectedDate(dateTo)}
                </span>

                <ChevronDown
                  data-icon="inline-end"
                  className={`shrink-0 text-[#5d6280] transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          }
        />

        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-600 text-admin-15">
            Unable to load dashboard
          </p>

          <p className="mt-1 text-red-500 text-admin-14">
            {error ?? "Something went wrong while loading the dashboard."}
          </p>

          <Button
            type="button"
            onClick={() => void loadDashboard(dateFrom, dateTo)}
            className="mt-4 bg-[#2720a8] text-white"
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
              className="h-[42px] min-w-[255px] justify-between border-[#dcddef] bg-white px-4 font-semibold text-[#15136f] text-admin-14"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-[#2720a8]" />

                {formatSelectedDate(dateFrom)} -{" "}
                {formatSelectedDate(dateTo)}
              </span>

              <ChevronDown
                data-icon="inline-end"
                className={`shrink-0 text-[#5d6280] transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`}
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
          iconVariant="blue"
        />

        <OverviewStatCard
          title="Pending Company Approvals"
          value={summary.pending_company_approvals}
          icon={Clock3}
          iconVariant="orange"
          subtitle="Awaiting review"
        />

        <OverviewStatCard
          title="Total Products"
          value={summary.total_products}
          icon={Package}
          iconVariant="purple"
        />

        <OverviewStatCard
          title="Pending Product Approvals"
          value={summary.pending_product_approvals}
          icon={Clock3}
          iconVariant="orange"
          subtitle="Awaiting review"
        />

        <OverviewStatCard
          title="Total Users"
          value={summary.total_users}
          icon={Users}
          iconVariant="blue"
        />

        <OverviewStatCard
          title="Total Inquiries"
          value={summary.total_inquiries}
          icon={MessagesSquare}
          iconVariant="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <PlatformGrowthChart data={platformGrowth} />

        <UserDistributionChart
          data={dashboard.user_distribution}
          totalUsers={summary.total_users}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[2600px]:grid-cols-3">
        <OverviewMiniTable
          title="Recent Company Registrations"
          viewAllHref="/companies"
          emptyMessage="No recent company registrations found."
          columns={[
            {
              key: "company",
              label: "Company Name",
              className: "font-medium text-[#15136f]",
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
              className: "font-medium text-[#15136f]",
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
              className: "font-medium text-[#15136f]",
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

/* -------------------------------------------------------------------------- */
/* Date Range Picker                                                           */
/* -------------------------------------------------------------------------- */

interface DateRangePickerProps {
  draftDateFrom: string;
  draftDateTo: string;
  setDraftDateFrom: (value: string) => void;
  setDraftDateTo: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

function DateRangePicker({
  draftDateFrom,
  draftDateTo,
  setDraftDateFrom,
  setDraftDateTo,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  return (
    <div
      data-admin-date-picker
      className="absolute right-0 top-[48px] z-50 w-[min(320px,calc(100vw-2rem))] rounded-[10px] border border-[#e0e2ed] bg-white p-5 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#171570] text-admin-15">
            Select Date Range
          </h3>

          <p className="mt-1 text-[#85899f] text-admin-14">
            Choose the period for dashboard data.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-full text-[#777b94] transition hover:bg-[#f3f3f8] hover:text-[#171570]"
          aria-label="Close date picker"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="admin-date-from"
            className="mb-1.5 block font-semibold text-[#454a68] text-admin-14"
          >
            From Date
          </label>

          <input
            id="admin-date-from"
            type="date"
            value={draftDateFrom}
            max={draftDateTo || undefined}
            onChange={(event) => setDraftDateFrom(event.target.value)}
            className="h-[42px] w-full rounded-[6px] border border-[#dcddef] bg-white px-3 text-[#313656] text-admin-14 outline-none transition focus:border-[#2720a8] focus:ring-2 focus:ring-[#2720a8]/10"
          />
        </div>

        <div>
          <label
            htmlFor="admin-date-to"
            className="mb-1.5 block font-semibold text-[#454a68] text-admin-14"
          >
            To Date
          </label>

          <input
            id="admin-date-to"
            type="date"
            value={draftDateTo}
            min={draftDateFrom || undefined}
            onChange={(event) => setDraftDateTo(event.target.value)}
            className="h-[42px] w-full rounded-[6px] border border-[#dcddef] bg-white px-3 text-[#313656] text-admin-14 outline-none transition focus:border-[#2720a8] focus:ring-2 focus:ring-[#2720a8]/10"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-[40px] flex-1 border-[#dcddef] bg-white font-semibold text-[#555b76] text-admin-14"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onApply}
          disabled={!draftDateFrom || !draftDateTo}
          className="h-[40px] flex-1 bg-[#2720a8] font-semibold text-admin-14 text-white hover:bg-[#1e188d]"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
