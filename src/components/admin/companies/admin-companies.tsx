"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";

import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { dataTableFeatures } from "@/lib/data-table-features";
import {
  exportAdminCompanies,
  getAdminCompanies,
  type AdminCompaniesResponse,
  type AdminCompanyDetail,
  type AdminCompanyExportVerificationStatus,
} from "@/lib/api/admin-companies-api";

import {
  createCompaniesColumns,
} from "./companies-columns";

import {
  CompaniesFilters,
} from "./companies-filters";

import {
  CompaniesStats,
} from "./companies-stats";

import {
  mapAdminCompanyToRow,
  type CompanyRow,
} from "./companies-data";
import { useCompanyFeatured } from "./use-company-featured";

export function AdminCompanies() {
  const searchParams = useSearchParams();



  const [companies, setCompanies] =
    React.useState<CompanyRow[]>([]);

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState<string | null>(null);

  const [totalItems, setTotalItems] =
    React.useState(0);

  const [paginationInfo, setPaginationInfo] =
    React.useState({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    React.useEffect(() => {
  const globalSearch =
    searchParams.get("search")?.trim() ?? "";

  setColumnFilters((previous) => [
    ...previous.filter((filter) => filter.id !== "search"),
    ...(globalSearch ? [{ id: "search", value: globalSearch }] : []),
  ]);

  setPagination((previous) => ({
    ...previous,
    pageIndex: 0,
  }));
}, [searchParams]);

  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [exporting, setExporting] =
  React.useState(false);

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({
      search: false,
    });

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [rowSelection, setRowSelection] =
    React.useState({});

  const loadSequence = React.useRef(0);
  const companySnapshot = React.useRef<Promise<{
    response: AdminCompaniesResponse;
    apiCompanies: AdminCompanyDetail[];
  }> | null>(null);

  const loadCompanies =
    React.useCallback(
      async () => {
        const sequence = ++loadSequence.current;
        try {
          setLoading(true);
          setError(null);

          const requestParams = {
    page:
      1,

    limit:
      pagination.pageSize,
  };

          // Reuse loaded companies while typing instead of requesting every page per keystroke.
          if (!companySnapshot.current) {
            companySnapshot.current = (async () => {
              const response = await getAdminCompanies(requestParams);
              const companyPages = [response.data?.companies ?? []];
              const totalPages = response.data?.pagination.totalPages ?? 1;
              for (let page = 2; page <= totalPages; page++) {
                const pageResponse = await getAdminCompanies({ ...requestParams, page });
                companyPages.push(pageResponse.data?.companies ?? []);
              }
              return { response, apiCompanies: companyPages.flat() };
            })().catch((error) => {
              companySnapshot.current = null;
              throw error;
            });
          }
          const { response, apiCompanies } = await companySnapshot.current;
          if (sequence !== loadSequence.current) return;
          apiCompanies.sort((a, b) => {
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            if (!a.is_featured) return 0;
            return (a.featured_priority ?? Number.MAX_SAFE_INTEGER) -
              (b.featured_priority ?? Number.MAX_SAFE_INTEGER);
          });

          const allRows = apiCompanies.map(mapAdminCompanyToRow);
          const filteredRows = allRows.filter((company) => columnFilters.every(({ id, value }) => {
            const filter = String(value).trim().toLowerCase();
            if (!filter) return true;
            if (id === "search") return `${company.name} ${company.companyId} ${company.location} ${company.businessType} ${company.businessTypes.join(" ")}`.toLowerCase().includes(filter);
            if (id === "verificationStatus") return company.verificationStatus.toLowerCase() === filter;
            if (id === "businessType") return [company.businessType, ...company.businessTypes].some((type) => type.toLowerCase() === filter);
            if (id === "location") return company.location.toLowerCase() === filter;
            if (id === "status") return company.isActive === (filter === "active");
            if (id === "featured") return company.featured === (filter === "featured");
            return true;
          }));
          const pageStart = pagination.pageIndex * pagination.pageSize;

          const mappedCompanies =
            filteredRows.slice(pageStart, pageStart + pagination.pageSize);

          setCompanies(
            mappedCompanies,
          );

          if (
            response.data?.pagination
          ) {
            setPaginationInfo(
              { ...response.data.pagination, totalItems: filteredRows.length, totalPages: Math.ceil(filteredRows.length / pagination.pageSize) },
            );

            setTotalItems(
              filteredRows.length,
            );
          } else {
            setTotalItems(
              mappedCompanies.length,
            );
          }
        } catch (err) {
          if (sequence !== loadSequence.current) return;
          console.error(
            "Failed to fetch admin companies:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch companies.",
          );

          setCompanies([]);
        } finally {
          if (sequence === loadSequence.current) setLoading(false);
        }
      },
      [
        pagination.pageIndex,
        pagination.pageSize,
        columnFilters,
      ],
    );

    const handleExportCompanies =
  React.useCallback(async () => {
    try {
      setExporting(true);

      /*
       * Send the current table filters to the export API
       * so the CSV matches what the admin is looking at.
       */
      const filterValue = (id: string) => {
        const value = String(columnFilters.find((filter) => filter.id === id)?.value ?? "").trim();
        return value && value !== "All" ? value : "";
      };

      const verificationFilter = filterValue("verificationStatus");
      const statusFilter = filterValue("status");
      const featuredFilter = filterValue("featured");
      const businessTypeFilter = filterValue("businessType");
      // Location is shown as "City, State"; the API filters by state only.
      const locationFilter = filterValue("location");

      const blob = await exportAdminCompanies({
        search: filterValue("search") || undefined,
        verification_status: verificationFilter
          ? (verificationFilter.toUpperCase().replaceAll(" ", "_") as AdminCompanyExportVerificationStatus)
          : "ALL",
        status: statusFilter ? (statusFilter === "Active" ? "ACTIVE" : "INACTIVE") : "ALL",
        featured: featuredFilter ? (featuredFilter === "Featured" ? "FEATURED" : "UNFEATURED") : "ALL",
        business_type: businessTypeFilter ? businessTypeFilter.toUpperCase() : undefined,
        state: locationFilter ? locationFilter.split(",").pop()?.trim() : undefined,
      });

      /*
       * Create a temporary URL for the
       * downloaded Excel file.
       */
      const url =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement("a");

      link.href = url;

      /*
       * Give the browser a sensible filename.
       */
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      link.download = `companies-${today}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      /*
       * Release the temporary object URL.
       */
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Failed to export companies:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to export companies.",
      );
    } finally {
      setExporting(false);
    }
  }, [columnFilters]);

  React.useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const reloadCompanies = React.useCallback(async () => {
    companySnapshot.current = null;
    await loadCompanies();
  }, [loadCompanies]);
  const featured = useCompanyFeatured(reloadCompanies, setError);
  const columns = React.useMemo(() => createCompaniesColumns(featured, reloadCompanies), [featured, reloadCompanies]);

  const table =
    useTable({
      features:
        dataTableFeatures,

      data: companies,

      columns:
        columns,

      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
        rowSelection,
      },

      getRowId: (row) =>
        row.id,

      autoResetPageIndex:
        false,

      manualPagination:
        true,
      manualFiltering: true,

      pageCount:
        paginationInfo.totalPages,

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

  /*
   * Stats are based on the API data returned for the
   * current filter/page, except total which comes from
   * API pagination.
   *
   * If the backend later provides dedicated statistics,
   * we can replace these calculations directly.
   */
  const verified =
    companies.filter(
      (company) =>
        company.rawVerificationStatus ===
        "VERIFIED",
    ).length;

  const pending =
    companies.filter(
      (company) =>
        // company.rawVerificationStatus ===
        //   "UNDER_VERIFICATION" ||
        company.rawVerificationStatus ===
          "PENDING",
    ).length;

  const rejected =
    companies.filter(
      (company) =>
        company.rawVerificationStatus ===
        "REJECTED",
    ).length;

  return (
    <div className="space-y-5">
      <PageHeader
  title="All Companies"
  description="View and manage all companies registered on CoolerGuru."
  action={
    <Button
      type="button"
      variant="outline"
      onClick={handleExportCompanies}
      disabled={exporting || loading}
      className="h-10 gap-2 border-[#cfcdf5] bg-card text-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {exporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}

      {exporting
        ? "Exporting..."
        : "Export Companies"}
    </Button>
  }
/>

      <CompaniesStats
        total={totalItems}
        verified={verified}
        pending={
          pending
        }
        rejected={rejected}
      />

      <CompaniesFilters
        table={table}
        activeFilters={columnFilters}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-admin-15">
          {error}
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-foreground text-admin-17">
            Companies (
            {totalItems}
            )
          </h2>

          {featured.isUpdating && (
            <span role="status" className="text-sm text-muted-foreground">Saving featured priorities…</span>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-admin-15">
              <Loader2 className="size-4 animate-spin" />

              Loading...
            </div>
          )}
        </div>

        <DataTable
          className="companies-table"
          rowProps={(company) => {
            const canDrag = company.featured && !featured.isUpdating;
            const isSource = featured.draggedCompanyId === company.companyId;
            const isTarget = featured.dropTargetCompanyId === company.companyId;
            const sourceIndex = companies.findIndex((item) => item.companyId === featured.draggedCompanyId);
            const targetIndex = companies.findIndex((item) => item.companyId === company.companyId);

            return {
              draggable: canDrag,
              "aria-busy": featured.isUpdating && company.featured,
              className: canDrag ? "company-reorder-row" : undefined,
              "data-drag-source": isSource || undefined,
              "data-drop-position": isTarget ? (sourceIndex < targetIndex ? "after" : "before") : undefined,
              onDragStart: (event) => {
                const target = event.target;
                if (!canDrag || (target instanceof Element &&
                    target.closest("button, a, input, select") && !target.closest("[data-company-drag-handle]"))) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(company.companyId));
                const bounds = event.currentTarget.getBoundingClientRect();
                event.dataTransfer.setDragImage(event.currentTarget, event.clientX - bounds.left, event.clientY - bounds.top);
                featured.startDrag(company.companyId);
              },
              onDragOver: (event) => {
                if (!canDrag || featured.draggedCompanyId === null || isSource) {
                  if (featured.dropTargetCompanyId !== null) featured.overDrag(null);
                  return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (!isTarget) featured.overDrag(company.companyId);
              },
              onDragLeave: (event) => {
                if (event.relatedTarget instanceof Node &&
                    !event.currentTarget.closest("table")?.contains(event.relatedTarget)) {
                  featured.overDrag(null);
                }
              },
              onDrop: (event) => {
                if (!canDrag || featured.draggedCompanyId === null || isSource) return;
                event.preventDefault();
                featured.drop(company.companyId);
                featured.resetDrag();
              },
              onDragEnd: featured.resetDrag,
            };
          }}
          table={table}
          emptyState={{
            title: loading
              ? "Loading companies..."
              : "No companies found",

            description: loading
              ? "Please wait while companies are being loaded."
              : "Try changing or resetting your filters.",
          }}
          paginationConfig={{
            pageSizeOptions: [
              10,
              20,
              30,
              50,
            ],
          }}
        />
      </div>
    </div>
  );
}

