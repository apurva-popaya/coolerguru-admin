"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "cn";

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
  rowProps?: (row: TData) => ComponentProps<"tr">;
}

export function DataTable<TData extends RowData>({
  table,
  toolbar,
  pagination = true,
  paginationConfig,
  emptyState,
  className,
  rowProps,
}: DataTableProps<TData>) {
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  const rows = table.getRowModel().rows;

  return (
    <div className={`admin-data-table overflow-hidden rounded-2xl border border-border bg-card ${className ?? ""}`}>
      {toolbar && <div className="border-border border-b px-4 py-4">{toolbar}</div>}

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
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
                  {...rowProps?.(row.original)}
                  key={row.id}
                  data-state={table.state.rowSelection?.[row.id] && "selected"}
                  className={cn("border-border/80 hover:bg-muted/50", rowProps?.(row.original).className)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-label={typeof cell.column.columnDef.header === "string"
                        ? cell.column.columnDef.header
                        : cell.column.id === "action" ? "Action" : cell.column.id}
                      className="px-5 py-5 text-foreground text-sm"
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-[180px] text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-semibold text-foreground text-sm">{emptyState?.title ?? "No results found"}</p>

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
