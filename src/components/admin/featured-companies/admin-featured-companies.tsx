"use client";

import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/page-header";
import { dataTableFeatures } from "@/lib/data-table-features";

import {
  getFeaturedCompanies,
  updateFeaturedCompany,
  type FeaturedBusinessType,
  type FeaturedFilter,
} from "@/lib/api/admin-featured-companies-api";

import type { FeaturedCompanyRow } from "./featured-companies-data";
import { createFeaturedCompaniesColumns } from "./featured-companies-columns";
import { FeaturedCompaniesFilters } from "./featured-companies-filters";

function mapApiCompanyToRow(
  company: {
    company_id: number;
    name: string;
    slug: string;
    company_logo_url: string;
    city: string;
    state: string;
    business_types: string[];
    is_featured: boolean;
    featured_since: string | null;
    featured_priority: number | null;
  },
): FeaturedCompanyRow {
  return {
    id: String(company.company_id),

    companyId: company.company_id,

    name: company.name,

    slug: company.slug,

    logoUrl: company.company_logo_url,

    location: [
      company.city,
      company.state,
    ]
      .filter(Boolean)
      .join(", "),

    businessTypes:
      company.business_types ?? [],

    businessType:
      company.business_types?.[0] ?? "",

    isFeatured: company.is_featured,

    featuredSince:
      company.featured_since,

    priority:
      company.featured_priority,
  };
}

function getFeaturedValue(
  value: unknown,
): FeaturedFilter {
  switch (value) {
    case "Featured":
      return "FEATURED";

    case "Not Featured":
      return "UNFEATURED";

    default:
      return "ALL";
  }
}

function getBusinessTypeValue(
  value: unknown,
): FeaturedBusinessType | undefined {
  switch (value) {
    case "Manufacturer":
      return "MANUFACTURER";

    case "Supplier":
      return "SUPPLIER";

    case "Exporter":
      return "EXPORTER";

    case "OEM":
      return "OEM";

    case "Distributor":
      return "DISTRIBUTOR";

    default:
      return undefined;
  }
}

/*
 * Fetch all featured companies.
 *
 * We need the complete featured list when reordering because
 * the priority is global, not limited to the currently visible
 * table page.
 */
async function getAllFeaturedCompanies() {
  const firstResponse =
    await getFeaturedCompanies({
      featured: "FEATURED",
      page: 1,
      limit: 100,
    });

  const firstCompanies =
    firstResponse.data?.companies ?? [];

  const totalPages = Math.max(
    Number(
      firstResponse.data?.pagination
        ?.total_pages ?? 1,
    ),
    1,
  );

  if (totalPages === 1) {
    return firstCompanies;
  }

  const remainingResponses =
    await Promise.all(
      Array.from(
        {
          length: totalPages - 1,
        },
        (_, index) =>
          getFeaturedCompanies({
            featured: "FEATURED",
            page: index + 2,
            limit: 100,
          }),
      ),
    );

  return [
    ...firstCompanies,
    ...remainingResponses.flatMap(
      (response) =>
        response.data?.companies ?? [],
    ),
  ];
}

export function AdminFeaturedCompanies() {
  const [companies, setCompanies] =
    React.useState<FeaturedCompanyRow[]>([]);

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState("");

  const [totalRows, setTotalRows] =
    React.useState(0);

  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({
      search: false,
      featuredStatus: false,
    });

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  /*
   * Drag/drop state.
   */
  const [draggedCompanyId, setDraggedCompanyId] =
    React.useState<number | null>(null);

  const [dropTargetCompanyId, setDropTargetCompanyId] =
    React.useState<number | null>(null);

  const [isReordering, setIsReordering] =
    React.useState(false);

  const searchValue =
    (columnFilters.find(
      (filter) =>
        filter.id === "search",
    )?.value as string) ?? "";

  const featuredStatusValue =
    columnFilters.find(
      (filter) =>
        filter.id === "featuredStatus",
    )?.value;

  const businessTypeValue =
    columnFilters.find(
      (filter) =>
        filter.id === "businessType",
    )?.value;

  const loadCompanies =
    React.useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getFeaturedCompanies({
            search:
              searchValue.trim() || undefined,

            featured:
              getFeaturedValue(
                featuredStatusValue,
              ),

            business_type:
              getBusinessTypeValue(
                businessTypeValue,
              ),

            page:
              pagination.pageIndex + 1,

            limit:
              pagination.pageSize,
          });

        const apiCompanies =
          response.data?.companies ?? [];

        setCompanies(
          apiCompanies.map(
            mapApiCompanyToRow,
          ),
        );

        const paginationData =
          response.data?.pagination ?? {};

        setTotalRows(
          Number(
            paginationData.total ?? 0,
          ),
        );
      } catch (error) {
        console.error(
          "Featured companies error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load featured companies.",
        );

        setCompanies([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    }, [
      searchValue,
      featuredStatusValue,
      businessTypeValue,
      pagination.pageIndex,
      pagination.pageSize,
    ]);

  React.useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  /*
   * --------------------------------------------------------------------------
   * ADD / REMOVE FEATURED
   * --------------------------------------------------------------------------
   */
  const toggleFeatured = React.useCallback(
    async (
      companyId: number,
      isFeatured: boolean,
      priority: number | null,
    ) => {
      const company = companies.find(
        (item) =>
          item.companyId === companyId,
      );

      if (!company) {
        return;
      }

      try {
        setError("");

        /*
         * REMOVE FROM FEATURED
         */
        if (isFeatured) {
          await updateFeaturedCompany(
            companyId,
            {
              is_featured: false,
            },
          );

          const featuredResponse =
            await getFeaturedCompanies({
              featured: "FEATURED",
              page: 1,
              limit: 100,
            });

          const remainingFeatured =
            featuredResponse.data
              ?.companies ?? [];

          remainingFeatured.sort(
            (a, b) =>
              (a.featured_priority ??
                Number.MAX_SAFE_INTEGER) -
              (b.featured_priority ??
                Number.MAX_SAFE_INTEGER),
          );

          for (
            let index = 0;
            index <
            remainingFeatured.length;
            index++
          ) {
            const featuredCompany =
              remainingFeatured[index];

            const newPriority =
              index + 1;

            if (
              featuredCompany.featured_priority !==
              newPriority
            ) {
              await updateFeaturedCompany(
                featuredCompany.company_id,
                {
                  is_featured: true,
                  priority: newPriority,
                },
              );
            }
          }

          await loadCompanies();

          return;
        }

        /*
         * ADD TO FEATURED
         */
        const featuredResponse =
          await getFeaturedCompanies({
            featured: "FEATURED",
            page: 1,
            limit: 100,
          });

        const featuredCompanies =
          featuredResponse.data
            ?.companies ?? [];

        const highestPriority =
          featuredCompanies.reduce(
            (maximum, item) =>
              Math.max(
                maximum,
                item.featured_priority ?? 0,
              ),
            0,
          );

        const newPriority =
          highestPriority + 1;

        await updateFeaturedCompany(
          companyId,
          {
            is_featured: true,
            priority: newPriority,
          },
        );

        await loadCompanies();
      } catch (error) {
        console.error(
          "Failed to update featured company:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update featured company.",
        );
      }
    },
    [companies, loadCompanies],
  );

  /*
   * --------------------------------------------------------------------------
   * DRAG START
   * --------------------------------------------------------------------------
   */
  const handleDragStart = React.useCallback(
    (companyId: number) => {
      setDraggedCompanyId(companyId);
      setDropTargetCompanyId(null);
    },
    [],
  );

  /*
   * --------------------------------------------------------------------------
   * DRAG END
   * --------------------------------------------------------------------------
   */
  const handleDragEnd = React.useCallback(() => {
    setDraggedCompanyId(null);
    setDropTargetCompanyId(null);
  }, []);

  /*
   * --------------------------------------------------------------------------
   * DRAG OVER
   * --------------------------------------------------------------------------
   */
  const handleDragOver = React.useCallback(
    (companyId: number) => {
      if (
        draggedCompanyId === null ||
        draggedCompanyId === companyId
      ) {
        return;
      }

      setDropTargetCompanyId(companyId);
    },
    [draggedCompanyId],
  );

  /*
   * --------------------------------------------------------------------------
   * REORDER FEATURED COMPANIES
   *
   * Example:
   *
   * Before:
   *
   * 1 ABC
   * 2 Arctic
   * 3 Cool
   * 4 MaxCool
   * 5 Blue Star
   *
   * Drag Blue Star -> ABC
   *
   * After:
   *
   * 1 Blue Star
   * 2 ABC
   * 3 Arctic
   * 4 Cool
   * 5 MaxCool
   *
   * We use a temporary priority first so that if the backend has
   * a unique priority constraint, we don't collide with an
   * existing priority while shifting the other companies.
   * --------------------------------------------------------------------------
   */
  const handleDrop = React.useCallback(
    async (targetCompanyId: number) => {
      if (
        draggedCompanyId === null ||
        draggedCompanyId === targetCompanyId ||
        isReordering
      ) {
        setDraggedCompanyId(null);
        setDropTargetCompanyId(null);

        return;
      }

      try {
        setIsReordering(true);
        setError("");

        const allFeatured =
          await getAllFeaturedCompanies();

        const orderedFeatured =
          [...allFeatured].sort(
            (a, b) =>
              (a.featured_priority ?? 0) -
              (b.featured_priority ?? 0),
          );

        const sourceIndex =
          orderedFeatured.findIndex(
            (company) =>
              company.company_id ===
              draggedCompanyId,
          );

        const targetIndex =
          orderedFeatured.findIndex(
            (company) =>
              company.company_id ===
              targetCompanyId,
          );

        if (
          sourceIndex === -1 ||
          targetIndex === -1
        ) {
          return;
        }

        /*
         * Nothing to change.
         */
        if (sourceIndex === targetIndex) {
          return;
        }

        const reordered =
          [...orderedFeatured];

        const [movedCompany] =
          reordered.splice(
            sourceIndex,
            1,
          );

        reordered.splice(
          targetIndex,
          0,
          movedCompany,
        );

        const maxPriority =
          orderedFeatured.length;

        /*
         * Step 1:
         *
         * Move the dragged company temporarily
         * outside the normal priority range.
         */
        await updateFeaturedCompany(
          movedCompany.company_id,
          {
            is_featured: true,
            priority: maxPriority + 1,
          },
        );

        /*
         * Step 2:
         *
         * Assign the final priority to every company
         * that changed position.
         *
         * We update all companies except the moved one
         * first.
         */
        for (
          let index = 0;
          index < reordered.length;
          index++
        ) {
          const company =
            reordered[index];

          const newPriority =
            index + 1;

          if (
            company.company_id ===
            movedCompany.company_id
          ) {
            continue;
          }

          if (
            company.featured_priority !==
            newPriority
          ) {
            await updateFeaturedCompany(
              company.company_id,
              {
                is_featured: true,
                priority: newPriority,
              },
            );
          }
        }

        /*
         * Step 3:
         *
         * Give the dragged company its final
         * priority.
         */
        await updateFeaturedCompany(
          movedCompany.company_id,
          {
            is_featured: true,
            priority:
              reordered.findIndex(
                (company) =>
                  company.company_id ===
                  movedCompany.company_id,
              ) + 1,
          },
        );

        /*
         * Reload the table from backend so the UI
         * and backend are guaranteed to be in sync.
         */
        await loadCompanies();
      } catch (error) {
        console.error(
          "Failed to reorder featured companies:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to reorder featured companies.",
        );

        /*
         * Reload in case some backend updates
         * succeeded before an error occurred.
         */
        await loadCompanies();
      } finally {
        setDraggedCompanyId(null);
        setDropTargetCompanyId(null);
        setIsReordering(false);
      }
    },
    [
      draggedCompanyId,
      isReordering,
      loadCompanies,
    ],
  );

  const columns = React.useMemo(
    () =>
      createFeaturedCompaniesColumns({
        onToggleFeatured:
          toggleFeatured,

        onDragStart:
          handleDragStart,

        onDragEnd:
          handleDragEnd,

        onDragOver:
          handleDragOver,

        onDrop:
          handleDrop,

        draggedCompanyId,

        dropTargetCompanyId,

        isReordering,
      }),
    [
      toggleFeatured,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
      draggedCompanyId,
      dropTargetCompanyId,
      isReordering,
    ],
  );

  const table = useTable({
    features: dataTableFeatures,

    data: companies,

    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },

    getRowId: (row) => row.id,

    autoResetPageIndex: false,

    onSortingChange: setSorting,

    onColumnFiltersChange:
      setColumnFilters,

    onColumnVisibilityChange:
      setColumnVisibility,

    onPaginationChange:
      setPagination,

    manualPagination: true,

    pageCount:
      totalRows > 0
        ? Math.ceil(
            totalRows /
              pagination.pageSize,
          )
        : 0,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Featured Companies"
        description="Manage companies featured on the homepage."
      />

      <FeaturedCompaniesFilters
        table={table}
      />

      {isReordering && (
        <div className="flex items-center gap-2 rounded-md border border-[#dcd9ff] bg-[#f7f6ff] px-4 py-3 text-admin-15 text-[#3025c7]">
          <div className="size-4 animate-spin rounded-full border-2 border-[#3025c7] border-t-transparent" />

          <span>
            Updating featured company order...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-admin-15 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center gap-3">
            <div className="size-7 animate-spin rounded-full border-2 border-[#2720a8] border-t-transparent" />

            <p className="font-medium text-muted-foreground text-admin-15">
              Loading companies...
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          table={table}
          emptyState={{
            title: "No companies found",
            description:
              "Try changing the featured company filters.",
          }}
        />
      )}
    </div>
  );
}