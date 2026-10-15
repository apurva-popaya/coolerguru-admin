"use client";

import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import {
  Download,
  Loader2,
} from "lucide-react";

import {
  DataTable,
} from "@/components/common/data-table/data-table";

import {
  PageHeader,
} from "@/components/common/page-header";

import {
  Button,
} from "@/components/ui/button";

import {
  exportAdminInquiries,
  getAdminInquiries,
  getAdminInquirySummary,
  type AdminInquirySummary,
  type AdminInquiryListItem,
} from "@/lib/api/admin-inquiries-api";

import {
  dataTableFeatures,
} from "@/lib/data-table-features";

import {
  inquiriesColumns,
} from "./inquiries-columns";

import {
  mapAdminInquiryToRow,
  type InquiryRow,
} from "./inquiries-data";

import {
  InquiriesFilters,
  type InquiryFilterValues,
} from "./inquiries-filters";

import {
  InquiriesStats,
} from "./inquiries-stats";

const initialFilters: InquiryFilterValues = {
  search: "",
  inquiryType: "ALL",
  dateFrom: "",
  dateTo: "",
};

const emptySummary: AdminInquirySummary = {
  total: 0,
  new: 0,
  replied: 0,
  in_discussion: 0,
  closed: 0,
  spam: 0,
};

export function AdminInquiries() {
  const inquirySnapshot = React.useRef<Promise<AdminInquiryListItem[]> | null>(null);
  const [
    inquiries,
    setInquiries,
  ] =
    React.useState<InquiryRow[]>(
      [],
    );

  const [
    summary,
    setSummary,
  ] =
    React.useState<AdminInquirySummary>(
      emptySummary,
    );

  const [
    filters,
    setFilters,
  ] =
    React.useState<InquiryFilterValues>(
      initialFilters,
    );

  const [
    appliedSearch,
    setAppliedSearch,
  ] = React.useState("");

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    error,
    setError,
  ] = React.useState("");

  const [
    totalItems,
    setTotalItems,
  ] = React.useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = React.useState(1);

  const [
    sorting,
    setSorting,
  ] =
    React.useState<SortingState>(
      [],
    );

  const [
    columnFilters,
    setColumnFilters,
  ] =
    React.useState<ColumnFiltersState>(
      [],
    );

  const [
    columnVisibility,
    setColumnVisibility,
  ] =
    React.useState<ColumnVisibilityState>({
      search: false,
    });

  const [
    pagination,
    setPagination,
  ] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [
    rowSelection,
    setRowSelection,
  ] = React.useState({});

  const [
    exporting,
    setExporting,
  ] = React.useState(false);

  const [
    exportError,
    setExportError,
  ] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const response =
          await getAdminInquirySummary();

        if (
          active &&
          response.data
        ) {
          setSummary(
            response.data.summary,
          );
        }
      } catch (error) {
        console.error(
          "Admin inquiry summary error:",
          error,
        );
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    async function loadInquiries() {
      setLoading(true);
      setError("");

      try {
        if (!inquirySnapshot.current) {
          inquirySnapshot.current = (async () => {
            const first = await getAdminInquiries({ page: 1, limit: 100 });
            if (!first.success || !first.data) throw new Error("Unable to load inquiries. Please try again.");
            const items = [...first.data.inquiries];
            for (let page = 2; page <= first.data.pagination.totalPages; page++) {
              const response = await getAdminInquiries({ page, limit: first.data.pagination.limit });
              if (!response.success || !response.data) throw new Error("Unable to load inquiries. Please try again.");
              items.push(...response.data.inquiries);
            }
            return items;
          })().catch((error) => {
            inquirySnapshot.current = null;
            throw error;
          });
        }
        const allInquiries = await inquirySnapshot.current;
        if (!active) return;
        const search = appliedSearch.toLowerCase();
        const matches = allInquiries.filter((inquiry) => {
          if (filters.inquiryType !== "ALL" && inquiry.inquiry_type !== filters.inquiryType) return false;
          if (filters.dateFrom || filters.dateTo) {
            const date = new Date(inquiry.created_at);
            if (Number.isNaN(date.getTime())) return false;
            const parts = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
            }).formatToParts(date);
            const dateKey = ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
            if (filters.dateFrom && dateKey < filters.dateFrom) return false;
            if (filters.dateTo && dateKey > filters.dateTo) return false;
          }
          return !search || `${inquiry.inquiry_number} ${inquiry.inquiry_id} ${inquiry.buyer_name} ${inquiry.buyer?.name ?? ""} ${inquiry.company?.name ?? ""} ${inquiry.product?.name ?? ""} ${inquiry.product_requirement}`.toLowerCase().includes(search);
        });
        const start = pagination.pageIndex * pagination.pageSize;
        setInquiries(matches.slice(start, start + pagination.pageSize).map(mapAdminInquiryToRow));
        setTotalItems(matches.length);
        setTotalPages(Math.max(Math.ceil(matches.length / pagination.pageSize), 1));

      } catch (error) {
        if (!active) {
          return;
        }

        setInquiries([]);
        setTotalItems(0);
        setTotalPages(1);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load inquiries.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInquiries();

    return () => {
      active = false;
    };
  }, [
    appliedSearch,
    filters.inquiryType,
    filters.dateFrom,
    filters.dateTo,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const table =
    useTable({
      features:
        dataTableFeatures,

      data:
        inquiries,

      columns:
        inquiriesColumns,

      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
        rowSelection,
      },

      getRowId:
        (row) => row.id,

      manualPagination:
        true,
      manualFiltering: true,

      pageCount:
        totalPages,

      rowCount:
        totalItems,

      autoResetPageIndex:
        false,

      onSortingChange:
        setSorting,

      onColumnFiltersChange:
        setColumnFilters,

      onColumnVisibilityChange:
        setColumnVisibility,

      onPaginationChange:
        setPagination,

      onRowSelectionChange:
        setRowSelection,
    });

  function handleFiltersChange(
    values: InquiryFilterValues,
  ) {
    setFilters(values);
    setAppliedSearch(values.search.trim());
    setRowSelection({});

    setPagination(
      (previous) => ({
        ...previous,
        pageIndex: 0,
      }),
    );
  }

  async function handleExport() {
    setExporting(true);
    setExportError("");

    try {
      /*
       * Export with the same filters applied
       * to the table.
       */
      const { blob, filename } =
        await exportAdminInquiries({
          search:
            appliedSearch ||
            undefined,


          inquiry_type:
            filters.inquiryType !==
            "ALL"
              ? filters.inquiryType
              : undefined,

          date_from:
            filters.dateFrom ||
            undefined,

          date_to:
            filters.dateTo ||
            undefined,
        });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to export inquiries.",
      );
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    setRowSelection({});
    setFilters(
      initialFilters,
    );

    setAppliedSearch("");

    setPagination(
      (previous) => ({
        ...previous,
        pageIndex: 0,
      }),
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inquiries"
        description="Monitor buyer and supplier inquiries across CoolerGuru"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={exporting || loading || Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)}
            aria-busy={exporting}
            className="h-10 gap-2 border-[#cfcdf5] bg-card text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {exporting ? "Exporting..." : "Export Inquiries"}
          </Button>
        }
      />

      {exportError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-admin-14 font-medium text-red-600"
        >
          {exportError}
        </div>
      ) : null}

      <InquiriesStats total={summary.total} newCount={summary.new} />

      <InquiriesFilters values={filters} onChange={handleFiltersChange} onReset={handleReset} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-admin-14 font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-admin-17 font-bold text-foreground">
          Inquiries ({totalItems})
        </h2>

        <DataTable
          className="inquiries-table"
          table={table}
          emptyState={{
            title:
              loading
                ? "Loading inquiries..."
                : "No inquiries found",

            description:
              loading
                ? "Please wait while inquiries are being loaded."
                : "Try changing or resetting the inquiry filters.",
          }}
        />
      </div>
    </div>
  );
}

