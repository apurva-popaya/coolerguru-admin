"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { PageHeader } from "@/components/common/page-header";

import {
  Building2,
  CalendarDays,
  ChevronDown,
  MessageSquare,
  Package,
  Store,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getAdminAnalytics,
  type AdminAnalyticsData,
  type AnalyticsGranularity,
} from "@/lib/api/admin-analytics-api";

import type { RankingItem } from "./analytics-data";

import { AnalyticsRankingCard } from "./analytics-ranking-card";
import { AnalyticsStatCard } from "./analytics-stat-card";
import { InquiryVolumeChart } from "./inquiry-volume-chart";
import { TopCategories } from "./top-categories";
import { UserGrowthChart } from "./user-growth-chart";

const mainStatIcons = [
  Users,
  Users,
  Store,
  Building2,
  Package,
  MessageSquare,
];

const monthlyStatIcons = [
  UserPlus,
  Building2,
  Package,
];

function getDefaultDateRange() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  const from = new Date(today.getFullYear(), today.getMonth() - 1, Math.min(today.getDate(), lastDay));
  const format = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  return { dateFrom: format(from), dateTo: format(today) };
}

function formatDateRange(
  dateFrom: string,
  dateTo: string,
) {
  const from = new Date(
    `${dateFrom}T00:00:00`,
  );

  const to = new Date(
    `${dateTo}T00:00:00`,
  );

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    return `${dateFrom} – ${dateTo}`;
  }

  const formatter =
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return `${formatter.format(from)} – ${formatter.format(to)}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function getComparisonLabel(
  granularity: AnalyticsGranularity,
) {
  if (granularity === "day") {
    return "vs previous period";
  }

  if (granularity === "week") {
    return "vs previous period";
  }

  return "vs previous period";
}

function createRankingItems(
  items: {
    product_id: number;
    name: string;
    saved_count: number;
  }[],
): RankingItem[] {
  return items.map((item) => ({
    id: `product-${item.product_id}`,
    name: item.name,
    value: formatNumber(
      item.saved_count,
    ),
  }));
}

function createCompanyRankingItems(
  items: {
    company_id: number;
    name: string;
    saved_count: number;
  }[],
): RankingItem[] {
  return items.map((item) => ({
    id: `company-${item.company_id}`,
    name: item.name,
    value: formatNumber(
      item.saved_count,
    ),
  }));
}

export function AdminAnalytics() {
  const defaultRange =
    React.useMemo(
      () => getDefaultDateRange(),
      [],
    );

  const [dateFrom, setDateFrom] =
    React.useState(
      defaultRange.dateFrom,
    );

  const [dateTo, setDateTo] =
    React.useState(
      defaultRange.dateTo,
    );

  const [period, setPeriod] =
    React.useState<
      "daily" | "weekly" | "monthly"
    >("daily");

  const [
    analytics,
    setAnalytics,
  ] =
    React.useState<AdminAnalyticsData | null>(
      null,
    );

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState<string | null>(
      null,
    );

  const fetchAnalytics =
    React.useCallback(async () => {
      if (!dateFrom || !dateTo) {
        return;
      }

      if (dateFrom > dateTo) {
        setError(
          "Start date cannot be after end date.",
        );

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const granularityMap: Record<
          "daily" | "weekly" | "monthly",
          AnalyticsGranularity
        > = {
          daily: "day",
          weekly: "week",
          monthly: "month",
        };

        const response =
          await getAdminAnalytics({
            date_from: dateFrom,
            date_to: dateTo,
            granularity:
              granularityMap[period],
          });

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.message ||
              "Unable to load analytics.",
          );
        }

        setAnalytics(
          response.data,
        );
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load analytics.";

        setError(message);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }, [
      dateFrom,
      dateTo,
      period,
    ]);

  React.useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const summary =
    analytics?.summary;

  const comparison =
    analytics?.comparison.metrics;

  const comparisonLabel =
    analytics
      ? getComparisonLabel(
          analytics.filters
            .granularity,
        )
      : "vs previous period";

  const mostSavedProducts =
    analytics
      ? createRankingItems(
          analytics.most_saved_products,
        )
      : [];

  const mostSavedCompanies =
    analytics
      ? createCompanyRankingItems(
          analytics.most_saved_companies,
        )
      : [];

  const handlePeriodChange = (
    value: string,
  ) => {
    if (
      value === "daily" ||
      value === "weekly" ||
      value === "monthly"
    ) {
      setPeriod(value);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex min-w-0 flex-col gap-4">
        <AnalyticsHeader
          dateFrom={dateFrom}
          dateTo={dateTo}
          period={period}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPeriodChange={
            handlePeriodChange
          }
        />

        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-border bg-card">
          <div className="text-muted-foreground text-admin-15">
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex min-w-0 flex-col gap-4">
        <AnalyticsHeader
          dateFrom={dateFrom}
          dateTo={dateTo}
          period={period}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPeriodChange={
            handlePeriodChange
          }
        />

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-card p-6 text-center">
          <p className="font-semibold text-foreground text-admin-15">
            Unable to load analytics
          </p>

          <p className="mt-2 text-red-600 text-admin-14">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void fetchAnalytics()
            }
            className="mt-4 rounded-[7px] bg-primary px-4 py-2 font-medium text-primary-foreground text-admin-14 hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || !summary || !comparison) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <AnalyticsHeader
        dateFrom={dateFrom}
        dateTo={dateTo}
        period={period}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onPeriodChange={
          handlePeriodChange
        }
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-admin-14">
          {error}
        </div>
      )}

      {/* PRIMARY STATS */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsStatCard
          title="Total Users"
          value={formatNumber(
            summary.total_users,
          )}
          growth={
            comparison.total_users
              .change_percentage
          }
          icon={mainStatIcons[0]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="Total Buyers"
          value={formatNumber(
            summary.total_buyers,
          )}
          growth={
            comparison.total_buyers
              .change_percentage
          }
          icon={mainStatIcons[1]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="Total Suppliers"
          value={formatNumber(
            summary.total_suppliers,
          )}
          growth={
            comparison.total_suppliers
              .change_percentage
          }
          icon={mainStatIcons[2]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="Companies"
          value={formatNumber(
            summary.total_companies,
          )}
          growth={
            comparison.total_companies
              .change_percentage
          }
          icon={mainStatIcons[3]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="Products"
          value={formatNumber(
            summary.total_products,
          )}
          growth={
            comparison.total_products
              .change_percentage
          }
          icon={mainStatIcons[4]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="Inquiries"
          value={formatNumber(
            summary.total_inquiries,
          )}
          growth={
            comparison.total_inquiries
              .change_percentage
          }
          icon={mainStatIcons[5]}
          comparisonLabel={
            comparisonLabel
          }
        />
      </div>

      {/* NEW DATA */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsStatCard
          title="New Users"
          value={formatNumber(
            summary.new_users,
          )}
          growth={
            comparison.new_users
              .change_percentage
          }
          icon={monthlyStatIcons[0]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="New Companies"
          value={formatNumber(
            summary.new_companies,
          )}
          growth={
            comparison.new_companies
              .change_percentage
          }
          icon={monthlyStatIcons[1]}
          comparisonLabel={
            comparisonLabel
          }
        />

        <AnalyticsStatCard
          title="New Products"
          value={formatNumber(
            summary.new_products,
          )}
          growth={
            comparison.new_products
              .change_percentage
          }
          icon={monthlyStatIcons[2]}
          comparisonLabel={
            comparisonLabel
          }
        />
      </div>

      {/* CHARTS */}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <InquiryVolumeChart
          data={
            analytics.inquiry_volume
          }
          totalInquiries={
            summary.total_inquiries
          }
        />

        <UserGrowthChart
          data={
            analytics.user_growth
          }
        />


      </div>

      {/* RANKINGS */}

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <TopCategories
          data={
            analytics.top_categories
          }
        />
        <AnalyticsRankingCard
          title="Most Saved Products"
          items={mostSavedProducts}
          type="product"
        />

        <AnalyticsRankingCard
          title="Most Saved Companies"
          items={mostSavedCompanies}
          type="company"
        />
      </div>

      {loading && (
        <div className="text-center text-muted-foreground text-admin-14">
          Updating analytics...
        </div>
      )}
    </div>
  );
}

interface AnalyticsHeaderProps {
  dateFrom: string;

  dateTo: string;

  period:
    | "daily"
    | "weekly"
    | "monthly";

  onDateFromChange: (
    value: string,
  ) => void;

  onDateToChange: (
    value: string,
  ) => void;

  onPeriodChange: (
    value: string,
  ) => void;
}

function AnalyticsHeader({
  dateFrom,
  dateTo,
  period,
  onDateFromChange,
  onDateToChange,
  onPeriodChange,
}: AnalyticsHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [draftFrom, setDraftFrom] = React.useState(dateFrom);
  const [draftTo, setDraftTo] = React.useState(dateTo);
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside, true);
    return () => document.removeEventListener("pointerdown", onOutside, true);
  }, [open]);

  return (
    <PageHeader title="Analytics" description="Track platform performance, growth and engagement."
      action={
        <div className="flex flex-wrap items-center gap-3">
          <div ref={container} data-admin-date-picker className="relative">
            <Button type="button" variant="outline" aria-expanded={open} aria-haspopup="dialog"
              className="h-[42px] rounded-xl px-4" onClick={() => {
                setDraftFrom(dateFrom); setDraftTo(dateTo); setOpen((previous) => !previous);
              }}>
              <CalendarDays data-icon="inline-start" />{formatDateRange(dateFrom, dateTo)}
              <ChevronDown data-icon="inline-end" />
            </Button>
            {open && <DateRangePicker draftDateFrom={draftFrom} draftDateTo={draftTo}
              setDraftDateFrom={setDraftFrom} setDraftDateTo={setDraftTo}
              onCancel={() => setOpen(false)} onApply={() => {
                if (!draftFrom || !draftTo || draftFrom > draftTo) return;
                onDateFromChange(draftFrom); onDateToChange(draftTo); setOpen(false);
              }} />}
          </div>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger aria-label="Chart interval" className="w-32 rounded-xl data-[size=default]:h-[42px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectGroup></SelectContent>
          </Select>
        </div>
      } />
  );
}
