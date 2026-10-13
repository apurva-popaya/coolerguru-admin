"use client";

import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Download } from "lucide-react";

import { DataTable } from "@/components/common/data-table/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { dataTableFeatures } from "@/lib/data-table-features";

import { activityColumns } from "./activity-columns";
import { activityData } from "./activity-data";
import { ActivityFilters } from "./activity-filters";

export function AdminActivity() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({
    search: false,
  });

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useTable({
    features: dataTableFeatures,

    data: activityData,

    columns: activityColumns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },

    getRowId: (row) => row.id,

    autoResetPageIndex: false,

    onSortingChange: setSorting,

    onColumnFiltersChange: setColumnFilters,

    onColumnVisibilityChange: setColumnVisibility,

    onPaginationChange: setPagination,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        description="View and monitor all platform activity in real time."
        action={
          <Button variant="outline" className="gap-2 border-[#cfcdf5] text-[#2720a8]">
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <ActivityFilters table={table} />

      <DataTable
        table={table}
        emptyState={{
          title: "No activity found",

          description: "Try changing the activity filters.",
        }}
      />
    </div>
  );
}
