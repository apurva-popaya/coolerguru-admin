"use client";

import * as React from "react";

import {
  Building2,
  CalendarDays,
  MessageSquare,
  Package,
  Store,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getAdminAnalytics,
  type AdminAnalyticsData,
  type AnalyticsGranularity,
} from "../../../lib/api/admin-analytics-api";

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

  const year = today.getFullYear();

  const dateFrom = `${year}-01-01`;

  const dateTo = [
    year,
    String(today.getMonth() + 1).padStart(
      2,
      "0",
    ),
    String(today.getDate()).padStart(
      2,
      "0",
    ),
  ].join("-");

  return {
    dateFrom,
    dateTo,
  };
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
    >("monthly");

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
      <div className="space-y-4">
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

        <div className="flex h-[400px] items-center justify-center rounded-[10px] border border-border bg-white">
          <div className="text-[#5d6280] text-admin-15">
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="space-y-4">
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

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[10px] border border-red-200 bg-white p-6 text-center">
          <p className="font-semibold text-[#15136f] text-admin-15">
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
            className="mt-4 rounded-[7px] bg-[#2720a8] px-4 py-2 font-medium text-white text-admin-14 hover:bg-[#15136f]"
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
    <div className="space-y-4">
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
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-admin-14">
          {error}
        </div>
      )}

      {/* PRIMARY STATS */}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
      </div>

      {/* PRODUCTS + INQUIRIES */}

      <div className="grid gap-3 md:grid-cols-2 ">
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-3 xl:grid-cols-3">
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

        <TopCategories
          data={
            analytics.top_categories
          }
        />
      </div>

      {/* RANKINGS */}

      <div className="grid gap-3 md:grid-cols-2">
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
        <div className="text-center text-[#5d6280] text-admin-14">
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
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="font-bold text-[#15136f] text-admin-27 leading-none">
          Analytics
        </h1>

        <p className="mt-2 text-[#5d6280] text-admin-14">
          Track overall platform performance and
          aggregated insights across buyers,
          suppliers, companies, products, and
          inquiries.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 items-center gap-2 rounded-[7px] border border-border bg-white px-3">
          <CalendarDays className="size-4 text-[#2720a8]" />

          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(event) =>
              onDateFromChange(
                event.target.value,
              )
            }
            className="h-8 border-0 bg-transparent font-medium text-[#15136f] text-admin-14 outline-none"
          />

          <span className="text-[#5d6280] text-admin-14">
            –
          </span>

          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(event) =>
              onDateToChange(
                event.target.value,
              )
            }
            className="h-8 border-0 bg-transparent font-medium text-[#15136f] text-admin-14 outline-none"
          />
        </div>

        <Select
          value={period}
          onValueChange={
            onPeriodChange
          }
        >
          <SelectTrigger className="h-10 w-[125px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="text-admin-15 [&_[data-slot=select-item]]:text-admin-15">
            <SelectItem value="daily">
              Daily
            </SelectItem>

            <SelectItem value="weekly">
              Weekly
            </SelectItem>

            <SelectItem value="monthly">
              Monthly
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}