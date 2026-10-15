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
import { type AdminProductListItem, type AdminProductsSummary, exportAdminProducts, getAdminProducts } from "@/lib/api/admin-products-api";
import { dataTableFeatures } from "@/lib/data-table-features";

import { createProductsColumns } from "./products-columns";
import { mapAdminProductToRow, type ProductRow } from "./products-data";
import { ProductsFilters, type ProductsFilterValues } from "./products-filters";
import { ProductsStats } from "./products-stats";

const initialFilters: ProductsFilterValues = {
  search: "",
  companyId: "ALL",
  categoryId: "ALL",
  status: "ALL",
  stockStatus: "ALL",
  approvalStatus: "ALL",
};

const emptySummary: AdminProductsSummary = {
  total: 0,
  active: 0,
  inactive: 0,
  approved: 0,
  pending_approval: 0,
  out_of_stock: 0,
};

export function AdminProducts() {
  const searchParams = useSearchParams();

  const [products, setProducts] = React.useState<ProductRow[]>([]);

  const [summary, setSummary] = React.useState<AdminProductsSummary>(emptySummary);

  const [totalItems, setTotalItems] = React.useState(0);

  const [totalPages, setTotalPages] = React.useState(1);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState("");

  const [filters, setFilters] = React.useState<ProductsFilterValues>(initialFilters);

  const [appliedSearch, setAppliedSearch] = React.useState("");

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({
    search: false,
  });

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [rowSelection, setRowSelection] = React.useState({});

  const [exporting, setExporting] = React.useState(false);

  const [exportError, setExportError] = React.useState("");
  const productSnapshot = React.useRef<Promise<AdminProductListItem[]> | null>(null);
  const [reloadVersion, setReloadVersion] = React.useState(0);
  const onStatusUpdated = React.useCallback(() => {
    productSnapshot.current = null;
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    setRowSelection({});
    setReloadVersion((previous) => previous + 1);
  }, []);
  const productsColumns = React.useMemo(() => createProductsColumns(onStatusUpdated), [onStatusUpdated]);

  React.useEffect(() => {
  const globalSearch = searchParams.get("search")?.trim() ?? "";

  setAppliedSearch(globalSearch);

  setFilters((previous) => ({
    ...previous,
    search: globalSearch,
  }));

  setPagination((previous) => ({
    ...previous,
    pageIndex: 0,
  }));
}, [searchParams]);

  React.useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        // Load all pages once so live search and dropdowns cover the complete product list.
        if (!productSnapshot.current) {
          productSnapshot.current = (async () => {
            const first = await getAdminProducts({ page: 1, limit: 100 });
            if (!first.success || !first.data) throw new Error("Unable to load products. Please try again.");
            const items = [...first.data.products];
            for (let page = 2; page <= first.data.pagination.totalPages; page++) {
              const response = await getAdminProducts({ page, limit: first.data.pagination.limit });
              if (!response.success || !response.data) throw new Error("Unable to load products. Please try again.");
              items.push(...response.data.products);
            }
            return items;
          })().catch((error) => {
            productSnapshot.current = null;
            throw error;
          });
        }
        const allProducts = await productSnapshot.current;
        if (!active) {
          return;
        }
        const search = appliedSearch.toLowerCase();
        const matchingProducts = allProducts.filter((product) => {
          if (search && !`${product.name} ${product.product_id} ${product.model_number ?? ""} ${product.sku ?? ""} ${product.company?.name ?? ""} ${product.category.name}`.toLowerCase().includes(search)) return false;
          if (filters.companyId !== "ALL" && String(product.company?.company_id) !== filters.companyId) return false;
          if (filters.categoryId !== "ALL" && String(product.category.category_id) !== filters.categoryId) return false;
          if (filters.status !== "ALL" && product.is_active !== (filters.status === "ACTIVE")) return false;
          if (filters.stockStatus !== "ALL" && product.availability_status !== filters.stockStatus) return false;
          if (filters.approvalStatus !== "ALL" && product.approval_status !== filters.approvalStatus) return false;
          return true;
        });
        const pageStart = pagination.pageIndex * pagination.pageSize;
        const rows = matchingProducts.slice(pageStart, pageStart + pagination.pageSize).map(mapAdminProductToRow);

        setProducts(rows);

        setSummary({
          total: matchingProducts.length,
          active: matchingProducts.filter((product) => product.is_active).length,
          inactive: matchingProducts.filter((product) => !product.is_active).length,
          approved: matchingProducts.filter((product) => product.approval_status === "APPROVED").length,
          pending_approval: matchingProducts.filter((product) => product.approval_status === "PENDING").length,
          out_of_stock: matchingProducts.filter((product) => product.availability_status === "OUT_OF_STOCK").length,
        });

        setTotalItems(matchingProducts.length);

        setTotalPages(Math.max(Math.ceil(matchingProducts.length / pagination.pageSize), 1));

      } catch (error) {
        if (!active) {
          return;
        }

        setProducts([]);

        setSummary(emptySummary);

        setTotalItems(0);

        setTotalPages(1);

        setError(error instanceof Error ? error.message : "Unable to load products.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, [
    reloadVersion,
    appliedSearch,
    filters.companyId,
    filters.categoryId,
    filters.status,
    filters.stockStatus,
    filters.approvalStatus,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const table = useTable({
    features: dataTableFeatures,

    data: products,

    columns: productsColumns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },

    getRowId: (row) => row.id,

    manualPagination: true,
    manualFiltering: true,

    pageCount: totalPages,

    rowCount: totalItems,

    autoResetPageIndex: false,

    onSortingChange: setSorting,

    onColumnFiltersChange: setColumnFilters,

    onColumnVisibilityChange: setColumnVisibility,

    onPaginationChange: setPagination,

    onRowSelectionChange: setRowSelection,
  });

  function handleFiltersChange(values: ProductsFilterValues) {
    setFilters(values);
    setAppliedSearch(values.search.trim());
    setRowSelection({});

    setPagination((previous) => ({
      ...previous,
      pageIndex: 0,
    }));
  }

  function handleReset() {
  setFilters(initialFilters);
  setRowSelection({});

  setAppliedSearch("");

  setPagination((previous) => ({
    ...previous,
    pageIndex: 0,
  }));
}

  async function handleExport() {
    setExporting(true);
    setExportError("");

    try {
      // Export with the same filters applied to the table.
      const { blob, filename } = await exportAdminProducts({
        search: appliedSearch || undefined,

        company_id: filters.companyId !== "ALL" ? Number(filters.companyId) : undefined,

        category_id: filters.categoryId !== "ALL" ? Number(filters.categoryId) : undefined,

        status: filters.status,

        stock_status: filters.stockStatus,

        approval_status: filters.approvalStatus,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to export products.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Products"
        description="View and manage all products added by sellers on CoolerGuru. Review product details, approval status and listings."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={exporting || loading}
            aria-busy={exporting}
            className="h-10 gap-2 border-[#cfcdf5] text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {exporting ? "Exporting..." : "Export Products"}
          </Button>
        }
      />

      {exportError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-600"
        >
          {exportError}
        </div>
      ) : null}

      <ProductsStats
        total={summary.total}
        approved={summary.approved}
        pending={summary.pending_approval}
      />

      <ProductsFilters
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-admin-14 font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-admin-17 font-bold text-foreground">Products ({totalItems})</h2>

        <DataTable
          className="products-table"
          table={table}
          emptyState={{
            title: loading ? "Loading products..." : "No products found",

            description: loading
              ? "Please wait while products are being loaded."
              : "Try changing or resetting your filters.",
          }}
        />
      </div>
    </div>
  );
}
