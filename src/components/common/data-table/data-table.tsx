"use client";

import type { ReactNode } from "react";

import type { ReactTable, RowData } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataTableFeatures } from "@/lib/data-table-features";

import { DataTablePagination } from "./data-table-pagination";
import type { DataTableEmptyState, DataTablePaginationConfig } from "./types";

interface DataTableProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>;

  toolbar?: ReactNode;

  pagination?: boolean;

  paginationConfig?: DataTablePaginationConfig;

  emptyState?: DataTableEmptyState;

  className?: string;
}

export function DataTable<TData extends RowData>({
  table,
  toolbar,
  pagination = true,
  paginationConfig,
  emptyState,
  className,
}: DataTableProps<TData>) {
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  const rows = table.getRowModel().rows;

  return (
    <div className={`admin-data-table overflow-hidden rounded-[10px] border border-border bg-white ${className ?? ""}`}>
      {toolbar && <div className="border-border border-b px-4 py-4">{toolbar}</div>}

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-[#fafafe]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-[46px] px-4 font-semibold text-[#15136f] text-[12px]">
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={table.state.rowSelection?.[row.id] && "selected"}
                  className="border-border/80 hover:bg-[#fafaff]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-[13px] text-[#11163d] text-[13px]">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-[180px] text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-semibold text-[#11163d] text-sm">{emptyState?.title ?? "No results found"}</p>

                    {emptyState?.description && (
                      <p className="text-muted-foreground text-xs">{emptyState.description}</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && <DataTablePagination table={table} config={paginationConfig} />}
    </div>
  );
}
